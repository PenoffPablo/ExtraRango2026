"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutAction() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [idempotencyKey, setIdempotencyKey] = useState("");

    useEffect(() => {
        setIdempotencyKey(crypto.randomUUID());
        const handleUpdate = () => setIdempotencyKey(crypto.randomUUID());
        
        window.addEventListener("cartUpdated", handleUpdate);
        return () => window.removeEventListener("cartUpdated", handleUpdate);
    }, []);

    const handleFinalizarCompra = async () => {
        setLoading(true);

        const storedUser = localStorage.getItem("usuario_extrarango");
        if (!storedUser) {
            alert("Debes iniciar sesión para confirmar el pedido.");
            router.push("/login");
            setLoading(false);
            return;
        }
        const user = JSON.parse(storedUser);

        const cartJson = localStorage.getItem("cart_extrarango");
        const cartItems = cartJson ? JSON.parse(cartJson) : [];

        if (cartItems.length === 0) {
            alert("El carrito está vacío");
            setLoading(false);
            return;
        }

        let cotizacionReal = 1500;
        try {
            const dolarRes = await fetch("/api/dolar");
            const dolarData = await dolarRes.json();
            if (dolarData.valor) cotizacionReal = Number(dolarData.valor);
        } catch { }

        const totalUSD = cartItems.reduce((acc: number, item: any) => {
            if (item.totalUsd) return acc + item.totalUsd;
            return acc + (Number(item.precio) * (item.quantity || 1));
        }, 0);

        const orderPayload = {
            idempotencyKey,
            cotizacion_dolar: cotizacionReal,
            total_usd: totalUSD,
            items: cartItems.map((item: any) => ({
                id: item.productoId || item.id,
                cantidad: item.cantidad || item.quantity || 1,
                precio: item.precioUnitarioUsd || item.precio,
                nombre: item.nombre,
                ojo: item.ojo || "AMBOS",
                esfera: item.esfera ?? null,
                cilindro: item.cilindro ?? null,
                eje: item.eje ?? null,
                esferaOD: item.esferaOD ?? null,
                cilindroOD: item.cilindroOD ?? null,
                ejeOD: item.ejeOD ?? null,
                esferaOI: item.esferaOI ?? null,
                cilindroOI: item.cilindroOI ?? null,
                ejeOI: item.ejeOI ?? null,
                adicion: item.adicion ?? null,
                adicionOD: item.adicionOD ?? null,
                adicionOI: item.adicionOI ?? null,
                prisma: item.prisma ?? null,
                ejePrisma: item.ejePrisma ?? null,
                prismaOD: item.prismaOD ?? null,
                ejePrismaOD: item.ejePrismaOD ?? null,
                prismaOI: item.prismaOI ?? null,
                ejePrismaOI: item.ejePrismaOI ?? null,
                armazonTransversal: item.armazonTransversal ?? null,
                armazonAltura: item.armazonAltura ?? null,
                armazonDiagonal: item.armazonDiagonal ?? null,
                armazonPuente: item.armazonPuente ?? null,
                tratamientos: item.tratamientos || [],
            }))
        };

        try {
            const response = await fetch("/api/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.removeItem("cart_extrarango");
                window.dispatchEvent(new Event("cartUpdated"));

                // Despachar evento global para que el Header (que siempre está montado) muestre el modal
                const successEvent = new CustomEvent("orderSuccess", { 
                    detail: { pedidoId: data.pedidoId } 
                });
                window.dispatchEvent(successEvent);
            } else {
                throw new Error(data.error || "Error al procesar");
            }

        } catch (error: any) {
            console.error("Error Checkout:", error);
            alert("Hubo un error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-t border-gray-100 mt-4 pt-4">
            <button
                type="button"
                onClick={handleFinalizarCompra}
                disabled={loading}
                className="w-full bg-[#00D1C1] text-white font-black py-3 rounded-xl hover:bg-[#00b8a9] transition-all shadow-lg shadow-[#00D1C1]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "PROCESANDO..." : "CONFIRMAR PEDIDO"}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-2">
                Al confirmar, el pedido pasará a estado PENDIENTE.
            </p>
        </div>
    );
}
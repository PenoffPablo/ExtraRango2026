"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutAction() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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
        const storedRate = localStorage.getItem("last_dollar_rate");
        const cotizacionReal = storedRate ? Number(storedRate) : 1500;
        const totalUSD = cartItems.reduce((acc: number, item: any) => {
            return acc + (Number(item.precio) * item.quantity);
        }, 0);

        const orderPayload = {
            usuario_id: user.id,
            cotizacion_dolar: cotizacionReal,
            total_usd: totalUSD,
            items: cartItems.map((item: any) => ({
                id: item.id,
                cantidad: item.quantity,
                precio: item.precio,
                nombre: item.nombre,
                ojo: "AMBOS",
                esfera: null,
                cilindro: null,
                eje: null
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

                alert(`¡Pedido #${data.pedidoId} creado con éxito!`);
                router.push("/perfil")
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
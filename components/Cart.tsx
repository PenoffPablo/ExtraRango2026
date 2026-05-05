"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Receipt, ArrowRight } from "lucide-react";
import { IVA_PORCENTAJE } from "@/lib/cuentas-bancarias";

export default function CheckoutAction() {
    const router = useRouter();
    const [tipoComprobante, setTipoComprobante] = useState<string>("");
    const [metodoEnvio, setMetodoEnvio] = useState<string>("");

    const handleRevisarPedido = () => {
        if (!tipoComprobante) {
            alert("Debes seleccionar el tipo de comprobante (Factura A o Remito).");
            return;
        }

        if (!metodoEnvio) {
            alert("Debes seleccionar una empresa de envío.");
            return;
        }

        const storedUser = localStorage.getItem("usuario_extrarango");
        if (!storedUser) {
            alert("Debes iniciar sesión para confirmar el pedido.");
            router.push("/login");
            return;
        }

        const cartJson = localStorage.getItem("cart_extrarango");
        const cartItems = cartJson ? JSON.parse(cartJson) : [];

        if (cartItems.length === 0) {
            alert("El carrito está vacío");
            return;
        }

        // Disparar evento para abrir el modal de confirmación (paso 2)
        const previewEvent = new CustomEvent("checkoutPreview", {
            detail: { tipoComprobante, metodoEnvio }
        });
        window.dispatchEvent(previewEvent);
    };

    return (
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-3">
            {/* SELECTOR DE COMPROBANTE — OBLIGATORIO */}
            <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                    Tipo de Comprobante *
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setTipoComprobante("FACTURA_A")}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all border-2 ${
                            tipoComprobante === "FACTURA_A"
                                ? "border-[#1F4E79] bg-[#1F4E79] text-white shadow-lg shadow-[#1F4E79]/20"
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                    >
                        <FileText size={14} />
                        Factura A
                    </button>
                    <button
                        type="button"
                        onClick={() => setTipoComprobante("REMITO")}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all border-2 ${
                            tipoComprobante === "REMITO"
                                ? "border-[#00D1C1] bg-[#00D1C1] text-white shadow-lg shadow-[#00D1C1]/20"
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                    >
                        <Receipt size={14} />
                        Remito
                    </button>
                </div>
                {tipoComprobante === "FACTURA_A" && (
                    <p className="text-[9px] text-amber-600 font-bold mt-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        ⚠️ Se sumará el {Math.round(IVA_PORCENTAJE * 100)}% de IVA al total. Transferencia a CBU de Procynter SRL.
                    </p>
                )}
                {tipoComprobante === "REMITO" && (
                    <p className="text-[9px] text-[#00D1C1] font-bold mt-1.5 bg-[#00D1C1]/5 px-2 py-1 rounded-lg border border-[#00D1C1]/20">
                        ✓ Sin IVA. Transferencia a CBU del titular.
                    </p>
                )}
            </div>

            {/* SELECTOR DE ENVÍO — OBLIGATORIO */}
            <div className="pt-2 border-t border-gray-100">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                    Método de Envío (Pago en Destino) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {["ANDREANI", "CORREO_ARGENTINO", "OCA"].map((metodo) => {
                        const labels: Record<string, string> = {
                            "ANDREANI": "Andreani",
                            "CORREO_ARGENTINO": "Correo Arg.",
                            "OCA": "OCA"
                        };
                        return (
                            <button
                                key={metodo}
                                type="button"
                                onClick={() => setMetodoEnvio(metodo)}
                                className={`flex items-center justify-center py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                                    metodoEnvio === metodo
                                        ? "border-[#1F4E79] bg-[#1F4E79] text-white shadow-lg shadow-[#1F4E79]/20"
                                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                }`}
                            >
                                {labels[metodo]}
                            </button>
                        );
                    })}
                </div>
                {metodoEnvio && (
                    <p className="text-[9px] text-[#1F4E79] font-bold mt-1.5 bg-[#1F4E79]/5 px-2 py-1 rounded-lg border border-[#1F4E79]/20">
                        📦 Abonas el costo del envío en sucursal/domicilio.
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={handleRevisarPedido}
                disabled={!tipoComprobante || !metodoEnvio}
                className="w-full bg-[#00D1C1] text-white font-black py-3 rounded-xl hover:bg-[#00b8a9] transition-all shadow-lg shadow-[#00D1C1]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                REVISAR PEDIDO
                <ArrowRight size={16} />
            </button>
            <p className="text-[10px] text-gray-400 text-center">
                Revisarás el detalle antes de confirmar.
            </p>
        </div>
    );
}
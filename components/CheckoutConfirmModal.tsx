"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, ShieldCheck, FileText, Receipt, Copy, CheckCircle,
    Clock, Building2, Package, Eye, Layers, X
} from "lucide-react";
import {
    CUENTAS_BANCARIAS, type TipoComprobante,
    IVA_PORCENTAJE, DESCUENTO_ANTICIPADO_PORCENTAJE, DESCUENTO_HORAS_LIMITE
} from "@/lib/cuentas-bancarias";

interface CheckoutConfirmModalProps {
    tipoComprobante: TipoComprobante;
    metodoEnvio: string;
    onClose: () => void;
}

export default function CheckoutConfirmModal({ tipoComprobante, metodoEnvio, onClose }: CheckoutConfirmModalProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cotizacion, setCotizacion] = useState(1500);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [cbuCopied, setCbuCopied] = useState(false);
    const [aliasCopied, setAliasCopied] = useState(false);
    const [idempotencyKey] = useState(() => crypto.randomUUID());

    const cuenta = CUENTAS_BANCARIAS[tipoComprobante];

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);

        // Cargar items del carrito
        const cartJson = localStorage.getItem("cart_extrarango");
        if (cartJson) setCartItems(JSON.parse(cartJson));

        // Obtener cotización
        fetch("/api/dolar")
            .then(res => res.json())
            .then(data => { if (data.valor) setCotizacion(Number(data.valor)); })
            .catch(() => {});

        return () => clearTimeout(timer);
    }, []);

    // Cálculos
    const totalUSD = cartItems.reduce((acc: number, item: any) => {
        if (item.totalUsd) return acc + item.totalUsd;
        return acc + (Number(item.precio) * (item.quantity || 1));
    }, 0);
    const totalARS = totalUSD * cotizacion;
    const montoIVA = tipoComprobante === "FACTURA_A" ? totalARS * IVA_PORCENTAJE : 0;
    const totalFinal = totalARS + montoIVA;
    const totalConDescuento = totalFinal * (1 - DESCUENTO_ANTICIPADO_PORCENTAJE);

    const copyToClipboard = async (text: string, type: "cbu" | "alias") => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
        if (type === "cbu") {
            setCbuCopied(true);
            setTimeout(() => setCbuCopied(false), 2000);
        } else {
            setAliasCopied(true);
            setTimeout(() => setAliasCopied(false), 2000);
        }
    };

    const handleConfirmar = async () => {
        setLoading(true);

        const orderPayload = {
            idempotencyKey,
            tipo_comprobante: tipoComprobante,
            metodo_envio: metodoEnvio,
            cotizacion_dolar: cotizacion,
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

                const successEvent = new CustomEvent("orderSuccess", {
                    detail: {
                        pedidoId: data.pedidoId,
                        tipoComprobante,
                        totalArs: data.total_ars,
                        montoIvaArs: data.monto_iva_ars,
                    }
                });
                window.dispatchEvent(successEvent);
                onClose();
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

    // Helpers para renderizar prescripción
    const formatValue = (val: any) => {
        if (val === null || val === undefined) return null;
        const n = Number(val);
        return n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
    };

    return (
        <div className="fixed inset-0 z-[190] flex items-end md:items-center justify-center md:p-4">
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-[#1F4E79]/70 backdrop-blur-lg transition-opacity duration-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative bg-white rounded-t-[28px] md:rounded-[28px] w-full md:max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-400 transform ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-100 md:scale-95 translate-y-6 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1F4E79] to-[#163a5a] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white transition-colors p-1"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-white font-black text-base md:text-lg tracking-tight">Confirmar Pedido</h2>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Revisá todo antes de confirmar</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto max-h-[calc(95vh-140px)] md:max-h-[calc(90vh-140px)] p-4 md:p-6 space-y-4 md:space-y-5">

                    {/* ─── MÉTODO DE ENVÍO ─── */}
                    <section>
                        <div className="bg-[#1F4E79]/5 rounded-xl border border-[#1F4E79]/10 p-3 md:p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-[#1F4E79]">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Método de Envío</p>
                                    <p className="text-sm font-black text-[#1F4E79]">
                                        {metodoEnvio === "ANDREANI" ? "Andreani" : metodoEnvio === "CORREO_ARGENTINO" ? "Correo Argentino" : "OCA"} (Pago en Destino)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── DETALLE DE PRODUCTOS ─── */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Package size={16} className="text-[#1F4E79]" />
                            <h3 className="text-sm font-black text-[#1F4E79] uppercase tracking-wide">Detalle del Pedido</h3>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">{cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}</span>
                        </div>
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            {cartItems.map((item, idx) => {
                                const itemKey = item.cartItemId || item.id || idx;
                                const itemTotalUsd = item.totalUsd || (Number(item.precio) * (item.quantity || 1));
                                const itemTotalArs = itemTotalUsd * cotizacion;

                                return (
                                    <div key={itemKey} className="px-4 py-3 hover:bg-white/60 transition-colors">
                                        {/* Nombre + precio */}
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-[#1F4E79] text-[13px] leading-snug">{item.nombre}</p>
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                    {item.ojo && (
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${item.ojo === "AMBOS" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-700"}`}>
                                                            {item.ojo === "AMBOS" ? "PAR" : `UNIDAD (${item.ojo})`}
                                                        </span>
                                                    )}
                                                    {item.tratamientos && item.tratamientos.length > 0 && (
                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00D1C1]/10 text-[#00D1C1]">
                                                            <Layers size={9} className="inline mr-0.5 -mt-px" />
                                                            {item.tratamientos.length} tratamiento{item.tratamientos.length > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-black text-[#00D1C1]">
                                                    ${itemTotalArs.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[9px] text-gray-400 font-medium">
                                                    USD {itemTotalUsd.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Receta */}
                                        {item.ojo === "AMBOS" && item.esferaOD !== undefined ? (
                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="bg-blue-50/80 rounded-lg px-2.5 py-1.5 border border-blue-100">
                                                    <p className="text-[8px] font-black text-blue-500 uppercase mb-0.5">Ojo Derecho (OD)</p>
                                                    <p className="text-[10px] font-mono font-bold text-gray-600">
                                                        ESF: {formatValue(item.esferaOD)} &nbsp; CIL: {formatValue(item.cilindroOD)}
                                                        {item.ejeOD !== null && item.ejeOD !== undefined ? ` × ${item.ejeOD}°` : ''}
                                                    </p>
                                                    {item.adicionOD && <p className="text-[9px] font-bold text-amber-600 mt-0.5">ADD: +{Number(item.adicionOD).toFixed(2)}</p>}
                                                    {item.prismaOD && <p className="text-[9px] font-bold text-purple-600 mt-0.5">Prisma: {Number(item.prismaOD).toFixed(2)}Δ {item.ejePrismaOD ? `(${item.ejePrismaOD}°)` : ''}</p>}
                                                </div>
                                                <div className="bg-emerald-50/80 rounded-lg px-2.5 py-1.5 border border-emerald-100">
                                                    <p className="text-[8px] font-black text-emerald-500 uppercase mb-0.5">Ojo Izquierdo (OI)</p>
                                                    <p className="text-[10px] font-mono font-bold text-gray-600">
                                                        ESF: {formatValue(item.esferaOI)} &nbsp; CIL: {formatValue(item.cilindroOI)}
                                                        {item.ejeOI !== null && item.ejeOI !== undefined ? ` × ${item.ejeOI}°` : ''}
                                                    </p>
                                                    {item.adicionOI && <p className="text-[9px] font-bold text-amber-600 mt-0.5">ADD: +{Number(item.adicionOI).toFixed(2)}</p>}
                                                    {item.prismaOI && <p className="text-[9px] font-bold text-purple-600 mt-0.5">Prisma: {Number(item.prismaOI).toFixed(2)}Δ {item.ejePrismaOI ? `(${item.ejePrismaOI}°)` : ''}</p>}
                                                </div>
                                            </div>
                                        ) : (item.esfera !== null && item.esfera !== undefined) && (
                                            <div className="mt-2 bg-gray-100/80 rounded-lg px-2.5 py-1.5 border border-gray-200 inline-block">
                                                <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">
                                                    <Eye size={8} className="inline mr-0.5 -mt-px" /> Prescripción {item.ojo !== "AMBOS" ? `(${item.ojo})` : ''}
                                                </p>
                                                <p className="text-[10px] font-mono font-bold text-gray-600">
                                                    ESF: {formatValue(item.esfera)} &nbsp; CIL: {formatValue(item.cilindro)}
                                                    {item.eje !== null && item.eje !== undefined ? ` × ${item.eje}°` : ''}
                                                </p>
                                                {item.adicion && <p className="text-[9px] font-bold text-amber-600 mt-0.5">ADD: +{Number(item.adicion).toFixed(2)}</p>}
                                                {item.prisma && <p className="text-[9px] font-bold text-purple-600 mt-0.5">Prisma: {Number(item.prisma).toFixed(2)}Δ {item.ejePrisma ? `(${item.ejePrisma}°)` : ''}</p>}
                                            </div>
                                        )}

                                        {/* Medidas de armazón */}
                                        {item.armazonTransversal && (
                                            <div className="mt-1.5 text-[9px] font-bold text-gray-400">
                                                Armazón: {item.armazonTransversal}□{item.armazonAltura} ∅{item.armazonDiagonal} — {item.armazonPuente}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ─── RESUMEN FINANCIERO ─── */}
                    <section>
                        <div className="bg-gradient-to-br from-[#1F4E79] via-[#1F4E79] to-[#00D1C1] rounded-2xl p-4 md:p-5 text-white">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Subtotal ({cartItems.length} producto{cartItems.length !== 1 ? 's' : ''})</span>
                                    <span className="font-bold">${totalARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {tipoComprobante === "FACTURA_A" && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">IVA 21%</span>
                                        <span className="font-bold">+ ${montoIVA.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="border-t border-white/20 pt-2 flex justify-between items-baseline gap-2">
                                    <span className="font-black uppercase text-xs md:text-sm tracking-wide shrink-0">Total a Transferir</span>
                                    <span className="text-2xl md:text-3xl font-black tracking-tight">
                                        ${totalFinal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Descuento 10% */}
                            <div className="mt-3 bg-white/10 rounded-xl px-3 md:px-4 py-2.5 flex items-center gap-2 md:gap-3">
                                <Clock size={18} className="text-amber-300 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-amber-200 uppercase tracking-wide">Pagá en {DESCUENTO_HORAS_LIMITE}hs y aboná solo</p>
                                    <p className="text-lg font-black">
                                        ${totalConDescuento.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        <span className="text-xs text-white/50 ml-1.5">(-{Math.round(DESCUENTO_ANTICIPADO_PORCENTAJE * 100)}%)</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── DATOS BANCARIOS ─── */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Building2 size={16} className="text-[#1F4E79]" />
                            <h3 className="text-sm font-black text-[#1F4E79] uppercase tracking-wide">Datos para la Transferencia</h3>
                        </div>

                        {/* Badge tipo comprobante */}
                        <div className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black uppercase mb-3 ${
                            tipoComprobante === "FACTURA_A"
                                ? "bg-[#1F4E79]/10 text-[#1F4E79]"
                                : "bg-[#00D1C1]/10 text-[#00D1C1]"
                        }`}>
                            {tipoComprobante === "FACTURA_A" ? <FileText size={14} /> : <Receipt size={14} />}
                            {tipoComprobante === "FACTURA_A" ? "Factura A — Con IVA 21%" : "Remito — Sin IVA"}
                        </div>

                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-3 md:p-4 space-y-3">
                            {/* Info del titular */}
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Titular</p>
                                    <p className="text-sm font-black text-gray-800">{cuenta.titular}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">CUIT</p>
                                    <p className="text-sm font-bold text-gray-700 font-mono">{cuenta.cuit}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Banco</p>
                                    <p className="text-sm font-bold text-gray-700">{cuenta.banco}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Tipo de Cuenta</p>
                                    <p className="text-sm font-bold text-gray-700">{cuenta.tipo_cuenta}</p>
                                </div>
                            </div>

                            {/* CBU copiable */}
                            <div className="bg-white rounded-xl border border-gray-200 px-3 md:px-4 py-3">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <div className="min-w-0">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">CBU</p>
                                        <p className="text-xs md:text-sm font-black text-[#1F4E79] font-mono tracking-wide break-all leading-relaxed">{cuenta.cbu}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(cuenta.cbu, "cbu")}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all shrink-0 ${
                                            cbuCopied
                                                ? "bg-green-100 text-green-600"
                                                : "bg-[#1F4E79]/10 text-[#1F4E79] hover:bg-[#1F4E79]/20"
                                        }`}
                                    >
                                        {cbuCopied ? <><CheckCircle size={12} /> Copiado</> : <><Copy size={12} /> Copiar CBU</>}
                                    </button>
                                </div>
                            </div>

                            {/* Alias copiable */}
                            <div className="bg-white rounded-xl border border-gray-200 px-3 md:px-4 py-3">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <div className="min-w-0">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Alias</p>
                                        <p className="text-sm font-black text-[#00D1C1] break-all">{cuenta.alias}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(cuenta.alias, "alias")}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all shrink-0 ${
                                            aliasCopied
                                                ? "bg-green-100 text-green-600"
                                                : "bg-[#00D1C1]/10 text-[#00D1C1] hover:bg-[#00D1C1]/20"
                                        }`}
                                    >
                                        {aliasCopied ? <><CheckCircle size={12} /> Copiado</> : <><Copy size={12} /> Copiar Alias</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ─── FOOTER FIJO ─── */}
                <div className="border-t border-gray-100 bg-white px-4 md:px-6 py-3 md:py-4 flex flex-col-reverse md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 md:py-3 rounded-xl text-sm font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50 text-center"
                    >
                        <ArrowLeft size={16} className="inline mr-1.5 -mt-0.5" />
                        Volver
                    </button>
                    <button
                        onClick={handleConfirmar}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-[#00D1C1] to-[#00b8a9] text-white font-black py-3 md:py-3.5 rounded-xl hover:shadow-lg hover:shadow-[#00D1C1]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                PROCESANDO...
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={18} />
                                CONFIRMAR PEDIDO
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

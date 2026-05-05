"use client";

import { useEffect, useState } from "react";
import { Check, ArrowRight, ClipboardCheck, Copy, CheckCircle, Clock, FileText, Receipt, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CUENTAS_BANCARIAS, type TipoComprobante, DESCUENTO_ANTICIPADO_PORCENTAJE, DESCUENTO_HORAS_LIMITE } from "@/lib/cuentas-bancarias";

interface SuccessModalProps {
    pedidoId: string;
    tipoComprobante?: TipoComprobante;
    totalArs?: number;
    montoIvaArs?: number;
    onClose: () => void;
}

export default function SuccessModal({ pedidoId, tipoComprobante, totalArs, montoIvaArs, onClose }: SuccessModalProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [cbuCopied, setCbuCopied] = useState(false);
    const [aliasCopied, setAliasCopied] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleGoToProfile = () => {
        onClose();
        router.push("/perfil");
    };

    const cuenta = tipoComprobante ? CUENTAS_BANCARIAS[tipoComprobante] : null;
    const montoTotal = (totalArs || 0) + (montoIvaArs || 0);
    const montoConDescuento = montoTotal * (1 - DESCUENTO_ANTICIPADO_PORCENTAJE);

    const copyToClipboard = async (text: string, type: "cbu" | "alias") => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === "cbu") {
                setCbuCopied(true);
                setTimeout(() => setCbuCopied(false), 2000);
            } else {
                setAliasCopied(true);
                setTimeout(() => setAliasCopied(false), 2000);
            }
        } catch {
            // Fallback para navegadores sin clipboard API
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            if (type === "cbu") {
                setCbuCopied(true);
                setTimeout(() => setCbuCopied(false), 2000);
            } else {
                setAliasCopied(true);
                setTimeout(() => setAliasCopied(false), 2000);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Overlay */}
            <div 
                className={`absolute inset-0 bg-[#1F4E79]/60 backdrop-blur-md transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleGoToProfile}
            />

            {/* Modal Content */}
            <div 
                className={`relative bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl transition-all duration-500 transform ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decoration Circles */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00D1C1]/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#1F4E79]/5 rounded-full blur-2xl" />

                <div className="px-6 py-8 flex flex-col items-center text-center max-h-[85vh] overflow-y-auto">
                    {/* Animated Green Tick */}
                    <div className="relative mb-5">
                        <div className={`w-16 h-16 bg-[#00D1C1]/10 rounded-full flex items-center justify-center transition-all duration-700 delay-300 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
                            <div className="w-12 h-12 bg-[#00D1C1] rounded-full flex items-center justify-center shadow-lg shadow-[#00D1C1]/30">
                                <Check size={28} className="text-white" strokeWidth={4} />
                            </div>
                        </div>
                        <div className={`absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full transition-all duration-500 delay-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                        <div className={`absolute top-8 -left-2 w-2 h-2 bg-blue-400 rounded-full transition-all duration-500 delay-800 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                    </div>

                    <h2 className="text-2xl font-black text-[#1F4E79] mb-2 tracking-tight">
                        ¡Pedido Confirmado!
                    </h2>
                    
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full mb-4">
                        <ClipboardCheck size={14} className="text-[#00D1C1]" />
                        <span className="text-sm font-bold text-gray-600">Pedido # {pedidoId}</span>
                    </div>

                    {/* SECCIÓN DE PAGO POR TRANSFERENCIA */}
                    {cuenta && (
                        <div className="w-full text-left space-y-3 mb-5">
                            {/* Tipo de comprobante badge */}
                            <div className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black uppercase ${
                                tipoComprobante === "FACTURA_A" 
                                    ? "bg-[#1F4E79]/10 text-[#1F4E79]" 
                                    : "bg-[#00D1C1]/10 text-[#00D1C1]"
                            }`}>
                                {tipoComprobante === "FACTURA_A" ? <FileText size={14} /> : <Receipt size={14} />}
                                {tipoComprobante === "FACTURA_A" ? "Factura A — IVA incluido" : "Remito — Sin IVA"}
                            </div>

                            {/* Monto a transferir */}
                            <div className="bg-gradient-to-r from-[#1F4E79] to-[#00D1C1] rounded-2xl p-4 text-white">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Monto a transferir</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black tracking-tight">
                                        ${montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                {montoIvaArs && montoIvaArs > 0 && (
                                    <p className="text-[10px] text-white/70 font-medium mt-1">
                                        Base: ${(totalArs || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} + IVA 21%: ${montoIvaArs.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </p>
                                )}
                                {/* Descuento 10% */}
                                <div className="mt-2 bg-white/15 rounded-lg px-3 py-2 flex items-center gap-2">
                                    <Clock size={14} className="text-amber-300 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-amber-200 uppercase">
                                            Pagá en {DESCUENTO_HORAS_LIMITE}hs y aboná solo
                                        </p>
                                        <p className="text-sm font-black text-white">
                                            ${montoConDescuento.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            <span className="text-[10px] text-white/60 ml-1">(-{Math.round(DESCUENTO_ANTICIPADO_PORCENTAJE * 100)}%)</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Datos bancarios */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 size={14} className="text-gray-400" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Datos para la transferencia</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">Titular</p>
                                            <p className="text-sm font-black text-gray-800">{cuenta.titular}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">CUIT</p>
                                        <p className="text-sm font-bold text-gray-700 font-mono">{cuenta.cuit}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Banco</p>
                                        <p className="text-sm font-bold text-gray-700">{cuenta.banco}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Tipo de cuenta</p>
                                        <p className="text-sm font-bold text-gray-700">{cuenta.tipo_cuenta}</p>
                                    </div>

                                    {/* CBU con botón copiar */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-3">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">CBU</p>
                                                <p className="text-xs font-black text-[#1F4E79] font-mono tracking-wide break-all leading-relaxed">{cuenta.cbu}</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(cuenta.cbu, "cbu")}
                                                className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 ${
                                                    cbuCopied 
                                                        ? "bg-green-100 text-green-600" 
                                                        : "bg-[#1F4E79]/10 text-[#1F4E79] hover:bg-[#1F4E79]/20"
                                                }`}
                                            >
                                                {cbuCopied ? <><CheckCircle size={12} /> Copiado</> : <><Copy size={12} /> Copiar CBU</>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Alias con botón copiar */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-3">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Alias</p>
                                                <p className="text-sm font-black text-[#00D1C1] break-all">{cuenta.alias}</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(cuenta.alias, "alias")}
                                                className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 ${
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
                            </div>

                            <p className="text-[9px] text-gray-400 text-center font-medium leading-relaxed">
                                Una vez realizada la transferencia, nuestro equipo verificará el pago y actualizará el estado de tu pedido.
                            </p>
                        </div>
                    )}

                    {!cuenta && (
                        <p className="text-gray-500 text-sm leading-relaxed mb-6 px-2">
                            Tu pedido ha sido creado con éxito y ya se encuentra en nuestro sistema para ser procesado.
                        </p>
                    )}

                    <button
                        onClick={handleGoToProfile}
                        className="group w-full bg-[#1F4E79] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#163a5a] transition-all shadow-xl shadow-[#1F4E79]/20 hover:shadow-[#1F4E79]/30 active:scale-[0.98]"
                    >
                        MIS PEDIDOS
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="mt-4 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>
    );
}

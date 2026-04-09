"use client";

import { useEffect, useState } from "react";
import { Check, ArrowRight, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
    pedidoId: string;
    onClose: () => void;
}

export default function SuccessModal({ pedidoId, onClose }: SuccessModalProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Breve delay para activar la animación de entrada
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleGoToProfile = () => {
        onClose();
        router.push("/perfil");
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
                className={`relative bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl transition-all duration-500 transform ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decoration Circles */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00D1C1]/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#1F4E79]/5 rounded-full blur-2xl" />

                <div className="px-8 py-10 flex flex-col items-center text-center">
                    {/* Animated Green Tick */}
                    <div className="relative mb-6">
                        <div className={`w-20 h-20 bg-[#00D1C1]/10 rounded-full flex items-center justify-center transition-all duration-700 delay-300 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
                            <div className="w-14 h-14 bg-[#00D1C1] rounded-full flex items-center justify-center shadow-lg shadow-[#00D1C1]/30">
                                <Check size={32} className="text-white" strokeWidth={4} />
                            </div>
                        </div>
                        {/* Sparkles */}
                        <div className={`absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full transition-all duration-500 delay-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                        <div className={`absolute top-8 -left-2 w-2 h-2 bg-blue-400 rounded-full transition-all duration-500 delay-800 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                    </div>

                    <h2 className="text-2xl font-black text-[#1F4E79] mb-2 tracking-tight">
                        ¡Pedido Confirmado!
                    </h2>
                    
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full mb-6">
                        <ClipboardCheck size={14} className="text-[#00D1C1]" />
                        <span className="text-sm font-bold text-gray-600">Remito # {pedidoId}</span>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-8 px-2">
                        Tu pedido ha sido creado con éxito y ya se encuentra en nuestro sistema para ser procesado.
                    </p>

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

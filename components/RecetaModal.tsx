"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Eye, ShoppingCart, Plus, Check, ChevronDown } from "lucide-react";

type Producto = {
    id: number;
    nombre: string;
    material: string | null;
    linea: string | null;
    esfera_desde: string | null;
    esfera_hasta: string | null;
    cilindro_hasta: string | null;
    precio_base_usd: string;
    precio_ars?: string;
};

type Tratamiento = {
    id: number;
    codigo: string;
    nombre: string;
    categoria: string | null;
    precio_usd: number;
};

interface RecetaModalProps {
    producto: Producto;
    onClose: () => void;
}

function generarPasos(desde: number, hasta: number, paso: number = 0.25): number[] {
    const valores: number[] = [];
    for (let v = desde; v <= hasta + 0.001; v += paso) {
        valores.push(Math.round(v * 100) / 100);
    }
    return valores;
}

export default function RecetaModal({ producto, onClose }: RecetaModalProps) {
    const [ojo, setOjo] = useState<"DERECHO" | "IZQUIERDO" | "AMBOS">("AMBOS");
    const [esfera, setEsfera] = useState<string>("");
    const [cilindro, setCilindro] = useState<string>("");
    const [eje, setEje] = useState<string>("");
    const [tratamientosSeleccionados, setTratamientosSeleccionados] = useState<number[]>([]);
    const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
    const [loadingTrat, setLoadingTrat] = useState(true);
    const [adding, setAdding] = useState(false);
    const [cotizacion, setCotizacion] = useState<number>(1480);

    // Cargar cotización desde API del dólar
    useEffect(() => {
        fetch("/api/dolar")
            .then(res => res.json())
            .then(data => {
                if (data.valor) setCotizacion(data.valor);
            })
            .catch(() => { });
    }, []);

    // Cargar tratamientos
    useEffect(() => {
        fetch("/api/tratamientos")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTratamientos(data);
                setLoadingTrat(false);
            })
            .catch(() => setLoadingTrat(false));
    }, []);

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const esferaDesde = Number(producto.esfera_desde || 0);
    const esferaHasta = Number(producto.esfera_hasta || 0);
    const cilindroHasta = Number(producto.cilindro_hasta || 0);

    const esferaOpciones = useMemo(() => generarPasos(esferaDesde, esferaHasta), [esferaDesde, esferaHasta]);
    const cilindroOpciones = useMemo(() => {
        if (cilindroHasta === 0) return [0];
        const desde = Math.min(cilindroHasta, 0);
        const hasta = Math.max(cilindroHasta, 0);
        return generarPasos(desde, hasta);
    }, [cilindroHasta]);

    const precioBaseUsd = Number(producto.precio_base_usd);

    const tratamientosSeleccionadosData = useMemo(() => {
        return tratamientos.filter(t => tratamientosSeleccionados.includes(t.id));
    }, [tratamientos, tratamientosSeleccionados]);

    const totalTratamientosUsd = useMemo(() => {
        return tratamientosSeleccionadosData.reduce((acc, t) => acc + t.precio_usd, 0);
    }, [tratamientosSeleccionadosData]);

    const cantidad = ojo === "AMBOS" ? 2 : 1;
    const totalUsd = (precioBaseUsd + totalTratamientosUsd) * cantidad;
    const totalArs = totalUsd * cotizacion;

    const toggleTratamiento = (id: number) => {
        setTratamientosSeleccionados(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Agrupar tratamientos por categoría
    const tratamientosPorCategoria = useMemo(() => {
        const grouped: Record<string, Tratamiento[]> = {};
        tratamientos.forEach(t => {
            const cat = t.categoria || "Otros";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(t);
        });
        return grouped;
    }, [tratamientos]);

    const puedeAgregar = esfera !== "" && cilindro !== "";

    const handleAgregar = () => {
        if (!puedeAgregar) return;
        setAdding(true);

        const cartItem = {
            cartItemId: `${producto.id}_${Date.now()}`,
            productoId: producto.id,
            nombre: producto.nombre,
            material: producto.material,
            linea: producto.linea,
            precioBaseUsd: precioBaseUsd,
            ojo,
            esfera: Number(esfera),
            cilindro: Number(cilindro),
            eje: eje ? Number(eje) : null,
            cantidad,
            tratamientos: tratamientosSeleccionadosData.map(t => ({
                id: t.id,
                nombre: t.nombre,
                precio_usd: t.precio_usd,
            })),
            totalTratamientosUsd,
            precioUnitarioUsd: precioBaseUsd + totalTratamientosUsd,
            totalUsd,
        };

        const cart = JSON.parse(localStorage.getItem("cart_extrarango") || "[]");
        cart.push(cartItem);
        localStorage.setItem("cart_extrarango", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));

        setTimeout(() => {
            setAdding(false);
            onClose();
        }, 400);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1F4E79] to-[#2a6da8] px-6 py-5 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Configurar Cristal</p>
                    <h2 className="text-xl font-black leading-tight pr-8">{producto.nombre}</h2>
                    <div className="flex gap-2 mt-2">
                        {producto.material && <span className="text-[9px] font-bold bg-white/15 px-2 py-0.5 rounded uppercase">{producto.material}</span>}
                        {producto.linea && <span className="text-[9px] font-bold bg-[#00D1C1]/30 px-2 py-0.5 rounded uppercase">{producto.linea}</span>}
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-black">${(precioBaseUsd * cotizacion).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                        <span className="text-xs text-white/50 font-medium">ARS / unidad</span>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Selección de Ojo */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">
                            <Eye size={12} className="inline mr-1 -mt-0.5" />
                            Seleccionar Ojo
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(["DERECHO", "IZQUIERDO", "AMBOS"] as const).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setOjo(opt)}
                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all border-2 ${ojo === opt
                                        ? "bg-[#1F4E79] text-white border-[#1F4E79] shadow-lg shadow-[#1F4E79]/20"
                                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-[#1F4E79]/30"
                                        }`}
                                >
                                    {opt === "AMBOS" ? "Ambos (par)" : `Ojo ${opt.charAt(0) + opt.slice(1).toLowerCase()}`}
                                </button>
                            ))}
                        </div>
                        {ojo === "AMBOS" && (
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Se aplica la misma receta a ambos ojos (2 unidades)</p>
                        )}
                    </div>

                    {/* Receta */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">
                            Datos de Receta
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {/* Esfera */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block ml-1">
                                    Esfera (SPH)
                                </label>
                                <select
                                    value={esfera}
                                    onChange={(e) => setEsfera(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent appearance-none"
                                >
                                    <option value="">Elegir...</option>
                                    {esferaOpciones.map(v => (
                                        <option key={v} value={v}>{v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}</option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-gray-400 mt-1 ml-1">
                                    Rango: {esferaDesde >= 0 ? `+${esferaDesde.toFixed(2)}` : esferaDesde.toFixed(2)} a {esferaHasta >= 0 ? `+${esferaHasta.toFixed(2)}` : esferaHasta.toFixed(2)}
                                </p>
                            </div>

                            {/* Cilindro */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block ml-1">
                                    Cilindro (CYL)
                                </label>
                                <select
                                    value={cilindro}
                                    onChange={(e) => setCilindro(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent appearance-none"
                                >
                                    <option value="">Elegir...</option>
                                    {cilindroOpciones.map(v => (
                                        <option key={v} value={v}>{v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}</option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-gray-400 mt-1 ml-1">
                                    Hasta: {cilindroHasta.toFixed(2)}
                                </p>
                            </div>

                            {/* Eje */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block ml-1">
                                    Eje (AXIS)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="180"
                                    value={eje}
                                    onChange={(e) => setEje(e.target.value)}
                                    placeholder="0-180°"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent"
                                />
                                <p className="text-[9px] text-gray-400 mt-1 ml-1">
                                    0° a 180°
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tratamientos */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">
                            <Plus size={12} className="inline mr-1 -mt-0.5" />
                            Tratamientos Adicionales
                        </label>

                        {loadingTrat ? (
                            <div className="text-center py-4 text-gray-400 text-sm animate-pulse">Cargando tratamientos...</div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(tratamientosPorCategoria).map(([categoria, items]) => (
                                    <div key={categoria}>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#1F4E79]/40 mb-2">{categoria}</p>
                                        <div className="space-y-1.5">
                                            {items.map(t => {
                                                const isSelected = tratamientosSeleccionados.includes(t.id);
                                                const precioArs = t.precio_usd * cotizacion;
                                                return (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => toggleTratamiento(t.id)}
                                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${isSelected
                                                            ? "border-[#00D1C1] bg-[#00D1C1]/5"
                                                            : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${isSelected
                                                                ? "bg-[#00D1C1] border-[#00D1C1]"
                                                                : "border-gray-300"
                                                                }`}>
                                                                {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                                            </div>
                                                            <span className={`text-sm font-bold ${isSelected ? "text-[#1F4E79]" : "text-gray-600"}`}>
                                                                {t.nombre}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm font-black whitespace-nowrap ${isSelected ? "text-[#00D1C1]" : "text-gray-400"}`}>
                                                            +${precioArs.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Resumen de precio */}
                <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-5">
                    {/* Desglose */}
                    <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Cristal base {ojo === "AMBOS" ? "(x2)" : "(x1)"}</span>
                            <span className="font-bold text-gray-700">${(precioBaseUsd * cantidad * cotizacion).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                        </div>
                        {tratamientosSeleccionadosData.length > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Tratamientos ({tratamientosSeleccionadosData.length}) {ojo === "AMBOS" ? "(x2)" : "(x1)"}</span>
                                <span className="font-bold text-[#00D1C1]">+${(totalTratamientosUsd * cantidad * cotizacion).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Estimado</span>
                            <span className="text-2xl font-black text-[#1F4E79]">${totalArs.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAgregar}
                        disabled={!puedeAgregar || adding}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${puedeAgregar && !adding
                            ? "bg-[#00D1C1] text-white hover:bg-[#00b8a9] shadow-[#00D1C1]/30"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                            }`}
                    >
                        <ShoppingCart size={18} />
                        {adding ? "¡AGREGADO!" : !puedeAgregar ? "Completá la receta" : "Agregar al Pedido"}
                    </button>
                </div>
            </div>
        </div>
    );
}

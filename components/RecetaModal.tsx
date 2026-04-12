"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Eye, ShoppingCart, Plus, Check } from "lucide-react";

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
    suma_max_pos?: number; // Nueva regla de suma meridional (+)
    suma_max_neg?: number; // Nueva regla de suma meridional (-)
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

// Componente reutilizable para los campos de receta de un ojo - DEBE ESTAR AFUERA PARA EVITAR PÉRDIDA DE FOCO
const CamposReceta = ({
    label,
    esferaVal,
    setEsferaVal,
    cilindroVal,
    setCilindroVal,
    ejeVal,
    setEjeVal,
    adicionVal,
    setAdicionVal,
    esferaEsValida,
    cilindroEsValido,
    combinacionOk,
    color,
    esferaDesde,
    esferaHasta,
    cilindroHasta,
    requiereAdicion,
    setErrorMsg,
    prismaVal,
    setPrismaVal,
    ejePrismaVal,
    setEjePrismaVal,
    campoMmVal,
    setCampoMmVal,
    producto,
}: {
    label: string;
    esferaVal: string;
    setEsferaVal: (v: string) => void;
    cilindroVal: string;
    setCilindroVal: (v: string) => void;
    ejeVal: string;
    setEjeVal: (v: string) => void;
    adicionVal: string;
    setAdicionVal: (v: string) => void;
    esferaEsValida: boolean;
    cilindroEsValido: boolean;
    combinacionOk: boolean;
    color: string;
    esferaDesde: number;
    esferaHasta: number;
    cilindroHasta: number;
    requiereAdicion: boolean;
    setErrorMsg: (v: string) => void;
    prismaVal: string;
    setPrismaVal: (v: string) => void;
    ejePrismaVal: string;
    setEjePrismaVal: (v: string) => void;
    campoMmVal?: string;
    setCampoMmVal?: (v: string) => void;
    producto: Producto;
}) => {
    const adicionValida = (val: string) => {
        if (val === "") return false;
        const n = Number(val);
        return n >= 0.75 && n <= 3.50;
    };

    const sumaEsfCil = esferaVal !== "" && cilindroVal !== "" ? Number(esferaVal) + Number(cilindroVal) : null;
    return (
        <div>
            <div className={`flex items-center gap-2 mb-2 px-1`}>
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">{label}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* Esfera */}
                <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block ml-1">
                        Esfera (SPH)
                    </label>
                    <input
                        type="number"
                        step="0.25"
                        min={esferaDesde}
                        max={esferaHasta}
                        value={esferaVal}
                        onChange={(e) => { 
                            setEsferaVal(e.target.value); 
                            setErrorMsg(""); 
                        }}
                        placeholder={`Ej: ${esferaDesde.toFixed(2)}`}
                        className={`w-full bg-gray-50 border rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent ${esferaVal !== "" && !esferaEsValida ? "border-red-500 bg-red-50 ring-2 ring-red-200" : "border-gray-200"}`}
                    />
                    <p className={`text-[9px] mt-1 ml-1 font-bold ${esferaVal !== "" && !esferaEsValida ? "text-red-500 animate-pulse" : "text-gray-400"}`}>
                        {esferaVal !== "" && !esferaEsValida ? "⚠ FUERA DE RANGO" : `Rango: ${esferaDesde >= 0 ? "+" : ""}${esferaDesde.toFixed(2)} a ${esferaHasta >= 0 ? "+" : ""}${esferaHasta.toFixed(2)}`}
                    </p>
                </div>

                {/* Cilindro */}
                <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block ml-1">
                        Cilindro (CYL)
                    </label>
                    <input
                        type="number"
                        step="0.25"
                        min={-Math.abs(cilindroHasta)}
                        max={Math.abs(cilindroHasta)}
                        value={cilindroVal}
                        onChange={(e) => { 
                            setCilindroVal(e.target.value); 
                            setErrorMsg(""); 
                        }}
                        placeholder="Ej: -1.00"
                        className={`w-full bg-gray-50 border rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent ${cilindroVal !== "" && !cilindroEsValido ? "border-red-500 bg-red-50 ring-2 ring-red-200" : "border-gray-200"}`}
                    />
                    <p className={`text-[9px] mt-1 ml-1 font-bold ${cilindroVal !== "" && !cilindroEsValido ? "text-red-500 animate-pulse" : "text-gray-400"}`}>
                        {cilindroVal !== "" && !cilindroEsValido ? "⚠ FUERA DE RANGO" : `Límite: ±${Math.abs(cilindroHasta).toFixed(2)}`}
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
                        value={ejeVal}
                        onChange={(e) => {
                            setEjeVal(e.target.value);
                            setErrorMsg("");
                        }}
                        placeholder="0-180°"
                        className={`w-full bg-gray-50 border rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent ${ejeVal !== "" && (Number(ejeVal) < 0 || Number(ejeVal) > 180) ? "border-red-500 bg-red-50 ring-2 ring-red-200" : "border-gray-200"}`}
                    />
                    <p className={`text-[9px] mt-1 ml-1 font-bold ${ejeVal !== "" && (Number(ejeVal) < 0 || Number(ejeVal) > 180) ? "text-red-500 animate-pulse" : "text-gray-400"}`}>
                        {ejeVal !== "" && (Number(ejeVal) < 0 || Number(ejeVal) > 180) ? "⚠ GRADOS INVÁLIDOS" : "0° a 180°"}
                    </p>
                </div>
            </div>

            {/* Campos de Prisma (Opcionales) - Solo para lentes No-Stock */}
            {!producto.linea?.toLowerCase().includes("stock") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 px-1 py-3 border-y border-gray-100 bg-gray-50/30 rounded-xl">
                    <div>
                    <label className="text-[10px] font-bold text-purple-600 mb-1 block ml-1">
                        Prisma (Δ)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={prismaVal}
                        onChange={(e) => setPrismaVal(e.target.value)}
                        placeholder="Opcional"
                        className="w-full bg-white border border-purple-100 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-purple-600 mb-1 block ml-1">
                        Base / Eje Prisma
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="360"
                        value={ejePrismaVal}
                        onChange={(e) => setEjePrismaVal(e.target.value)}
                        placeholder="0-360°"
                        className="w-full bg-white border border-purple-100 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                </div>
            </div>
            )}

            {/* Campo en mm (Solo Baja Visión) */}
            {(producto.nombre.toLowerCase().includes("lenticular") || producto.nombre.toLowerCase().includes("sajonia")) && setCampoMmVal !== undefined && (
                <div className="mt-3 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                    <label className="text-[10px] font-bold text-indigo-600 mb-1 block ml-1">
                        Campo Visual (mm)
                    </label>
                    <input
                        type="number"
                        min="20"
                        max="30"
                        value={campoMmVal}
                        onChange={(e) => {
                            if (setCampoMmVal) setCampoMmVal(e.target.value);
                            setErrorMsg("");
                        }}
                        placeholder={producto.nombre.toLowerCase().includes("lenticular") ? "Ej: 22 (De 20 a 24)" : "Ej: 25 (De 24 a 26)"}
                        className="w-full bg-white border border-indigo-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                </div>
            )}

            {/* ADD - Adición (solo bifocales/multifocales) */}
            {requiereAdicion && (
                <div className="mt-3">
                    <label className="text-[10px] font-bold text-amber-600 mb-1 block ml-1">
                        🔶 Adición (ADD)
                    </label>
                    <input
                        type="number"
                        step="0.25"
                        min="0.75"
                        max="3.50"
                        value={adicionVal}
                        onChange={(e) => { setAdicionVal(e.target.value); setErrorMsg(""); }}
                        placeholder="Ej: +2.00"
                        className={`w-full max-w-[200px] bg-amber-50/50 border rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${adicionVal !== "" && !adicionValida(adicionVal) ? "border-red-400 bg-red-50/50" : "border-amber-200"}`}
                    />
                    <p className="text-[9px] text-amber-500 mt-1 ml-1">
                        Rango: +0.75 a +3.50 (pasos de 0.25)
                    </p>
                </div>
            )}

            {/* Indicador de potencia combinada ESF+CIL */}
            {sumaEsfCil !== null && (
                <div className={`mt-2 px-2 py-2 rounded-lg text-[10px] font-bold flex flex-col gap-1 ${!combinacionOk ? "bg-red-50 border border-red-200 text-red-600" : "bg-gray-50 border border-gray-100 text-gray-500"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                            <span>Suma (ESF+CIL):</span>
                            <span className={`font-black ${!combinacionOk ? "text-amber-700" : "text-[#1F4E79]"}`}>
                                {sumaEsfCil >= 0 ? `+${sumaEsfCil.toFixed(2)}` : sumaEsfCil.toFixed(2)}
                            </span>
                        </div>
                        {!combinacionOk && esferaEsValida && (
                            <span className="text-amber-500 font-black animate-pulse uppercase">
                                ⚠ Ajustar Cilindro
                            </span>
                        )}
                    </div>
                    
                    {esferaVal !== "" && !esferaEsValida && (
                        <p className="text-[9px] text-red-500 font-bold animate-pulse leading-tight mt-1">
                            ⚠️ ESFERA FUERA DE RANGO: El límite para este cristal es de {esferaDesde.toFixed(2)} a {esferaHasta >= 0 ? '+' : ''}{esferaHasta.toFixed(2)}.
                        </p>
                    )}

                    {cilindroVal !== "" && !cilindroEsValido && (
                        <p className="text-[9px] text-red-500 font-bold animate-pulse leading-tight mt-1">
                            ⚠️ CILINDRO FUERA DE RANGO: El límite máximo para este cristal es de ±{Math.abs(cilindroHasta).toFixed(2)}.
                        </p>
                    )}

                    {ejeVal !== "" && (Number(ejeVal) < 0 || Number(ejeVal) > 180) && (
                        <p className="text-[9px] text-red-500 font-bold animate-pulse leading-tight mt-1">
                            ⚠️ EJE INVÁLIDO: Los grados del eje deben estar entre 0° y 180°.
                        </p>
                    )}

                    {esferaVal !== "" && cilindroVal !== "" && esferaEsValida && cilindroEsValido && !combinacionOk && (
                        <p className="text-[9px] text-amber-600 font-bold leading-tight mt-1 bg-amber-50 p-1.5 rounded border border-amber-200">
                            ⚠️ POTENCIA COMBINADA (ESF+CIL): El valor de {sumaEsfCil !== null ? (sumaEsfCil >= 0 ? '+' : '') + sumaEsfCil.toFixed(2) : ""} excede el límite de talla de este producto (Rango: {producto.suma_max_neg ? Number(producto.suma_max_neg).toFixed(2) : esferaDesde.toFixed(2)} a {producto.suma_max_pos ? (Number(producto.suma_max_pos) >= 0 ? '+' : '') + Number(producto.suma_max_pos).toFixed(2) : (esferaHasta >= 0 ? '+' : '') + esferaHasta.toFixed(2)}).
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default function RecetaModal({ producto, onClose }: RecetaModalProps) {
    const [ojo, setOjo] = useState<"DERECHO" | "IZQUIERDO" | "AMBOS">("AMBOS");

    // Campos para ojo único (DERECHO o IZQUIERDO)
    const [esfera, setEsfera] = useState<string>("");
    const [cilindro, setCilindro] = useState<string>("");
    const [eje, setEje] = useState<string>("");
    const [prisma, setPrisma] = useState<string>("");
    const [ejePrisma, setEjePrisma] = useState<string>("");
    const [campoMm, setCampoMm] = useState<string>("");

    // Campos separados para AMBOS ojos
    const [esferaOD, setEsferaOD] = useState<string>("");
    const [cilindroOD, setCilindroOD] = useState<string>("");
    const [ejeOD, setEjeOD] = useState<string>("");
    const [prismaOD, setPrismaOD] = useState<string>("");
    const [ejePrismaOD, setEjePrismaOD] = useState<string>("");
    const [campoMmOD, setCampoMmOD] = useState<string>("");

    const [esferaOI, setEsferaOI] = useState<string>("");
    const [cilindroOI, setCilindroOI] = useState<string>("");
    const [ejeOI, setEjeOI] = useState<string>("");
    const [prismaOI, setPrismaOI] = useState<string>("");
    const [ejePrismaOI, setEjePrismaOI] = useState<string>("");
    const [campoMmOI, setCampoMmOI] = useState<string>("");

    // Campo de adición para bifocales/multifocales
    const [adicion, setAdicion] = useState<string>("");
    const [adicionOD, setAdicionOD] = useState<string>("");
    const [adicionOI, setAdicionOI] = useState<string>("");

    // Medidas del Armazón
    const [showArmazon, setShowArmazon] = useState(false);
    const [armazonTransversal, setArmazonTransversal] = useState<string>("");
    const [armazonAltura, setArmazonAltura] = useState<string>("");
    const [armazonDiagonal, setArmazonDiagonal] = useState<string>("");
    const [armazonPuente, setArmazonPuente] = useState<string>("");

    const [tratamientosSeleccionados, setTratamientosSeleccionados] = useState<number[]>([]);
    const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
    const [loadingTrat, setLoadingTrat] = useState(true);
    const [adding, setAdding] = useState(false);
    const [cotizacion, setCotizacion] = useState<number>(1480);
    const [errorMsg, setErrorMsg] = useState<string>("");

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

    // Detectar si el producto requiere adición (bifocal, multifocal, ocupacional)
    const requiereAdicion = useMemo(() => {
        const linea = (producto.linea || "").toLowerCase();
        return linea.includes("bifocal") || linea.includes("multifocal") || linea.includes("ocupacional");
    }, [producto.linea]);

    const adicionValida = (val: string) => {
        if (val === "") return false;
        const n = Number(val);
        return n >= 0.75 && n <= 3.50;
    };

    const precioBaseUsd = Number(producto.precio_base_usd);

    const tratamientosSeleccionadosData = useMemo(() => {
        return tratamientos.filter(t => tratamientosSeleccionados.includes(t.id));
    }, [tratamientos, tratamientosSeleccionados]);

    const totalTratamientosUsd = useMemo(() => {
        return tratamientosSeleccionadosData.reduce((acc, t) => acc + t.precio_usd, 0);
    }, [tratamientosSeleccionadosData]);

    // Lógica de cálculo: El precio base de la DB es por PAR.
    const isPair = ojo === "AMBOS";
    const multiplier = isPair ? 1 : 0.5;

    const totalUsd = (precioBaseUsd + totalTratamientosUsd) * multiplier;
    const totalArs = totalUsd * cotizacion;

    // Lógica de compatibilidad de tratamientos basanda en el producto
    const esTratamientoCompatible = (t: Tratamiento) => {
        const linea = (producto.linea || "").toLowerCase();
        const nombre = (producto.nombre || "").toLowerCase();
        const material = (producto.material || "").toLowerCase();
        const isStock = linea.includes("stock");

        // 1. Recargos de Tallado/Técnico (IRISTOP, SPORTDESING, ANTIPARRAS, etc.)
        if (t.categoria === "Recargo Tallado" || t.categoria === "Recargo Técnico") {
            if (isStock) return false;
        }

        // 2. ANTIPARRAS: Solo con Poly de Laboratorio
        if (t.codigo === "REC-ANTIPARRAS") {
            if (isStock) return false;
            if (!material.includes("poly") && !material.includes("policarbonato")) return false;
        }

        // 3. Antirreflejo: Ocultar si el lente ya lo incluye
        if (t.categoria === "Antirreflejo") {
            if (nombre.includes("antirreflex") || nombre.includes(" ar ") || nombre.endsWith(" ar")) return false;
        }

        // 4. Blue Cut: Ocultar si el lente ya es Blue
        if (t.categoria === "Protección") {
            if (nombre.includes("blue")) return false;
        }

        // 5. Color: Ocultar en lentes solares/polarizados/fotocromáticos que ya tienen color
        if (t.categoria === "Color") {
            if (linea.includes("solar") || material.includes("solar") || material.includes("polarizado")) return false;
            if (nombre.includes("gris") || nombre.includes("sepia")) return false;
        }

        // 6. Máscaras de Buceo: No mostrar en el modal de receta como tratamiento
        if (t.codigo === "REC-MASCARA-BUCEO") return false;

        return true;
    };

    const toggleTratamiento = (id: number) => {
        const t = tratamientos.find(x => x.id === id);
        if (!t) return;

        setTratamientosSeleccionados(prev => {
            const isSelected = prev.includes(id);
            if (isSelected) {
                return prev.filter(x => x !== id);
            } else {
                // Mutua exclusión: quitar otros del mismo grupo/categoría si corresponde
                const otrosDeLaMismaCategoria = tratamientos
                    .filter(x => x.categoria === t.categoria && x.id !== t.id)
                    .map(x => x.id);

                return [...prev.filter(x => !otrosDeLaMismaCategoria.includes(x)), id];
            }
        });
    };

    // Agrupar tratamientos por categoría (filtrando incompatibles)
    const tratamientosPorCategoria = useMemo(() => {
        const grouped: Record<string, Tratamiento[]> = {};
        tratamientos.forEach(t => {
            if (!esTratamientoCompatible(t)) return;
            const cat = t.categoria || "Otros";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(t);
        });
        return grouped;
    }, [tratamientos, producto]);

    const MAX_ITEMS_CARRITO = 5;

    // Función para validar la combinación ESF + CIL (potencia meridional)
    const combinacionValida = (esf: string, cil: string) => {
        if (esf === "" || cil === "") return true;
        const suma = Number(esf) + Number(cil);

        // Límite superior (+)
        const maxPos = producto.suma_max_pos !== undefined ? Number(producto.suma_max_pos) : esferaHasta;
        // Límite inferior (-)
        const maxNeg = producto.suma_max_neg !== undefined ? Number(producto.suma_max_neg) : esferaDesde;

        return suma >= maxNeg && suma <= maxPos;
    };

    // Validaciones para ojo único
    const esferaValida = esfera !== "" && Number(esfera) >= esferaDesde && Number(esfera) <= esferaHasta;
    const cilindroValido = cilindro !== "" && Math.abs(Number(cilindro)) <= Math.abs(cilindroHasta);
    const combinacionOkSingle = combinacionValida(esfera, cilindro);
    const ejeValidoSingle = eje === "" || (Number(eje) >= 0 && Number(eje) <= 180);

    // Validaciones para AMBOS - OD
    const esferaODValida = esferaOD !== "" && Number(esferaOD) >= esferaDesde && Number(esferaOD) <= esferaHasta;
    const cilindroODValido = cilindroOD !== "" && Math.abs(Number(cilindroOD)) <= Math.abs(cilindroHasta);
    const combinacionOkOD = combinacionValida(esferaOD, cilindroOD);
    const ejeODValido = ejeOD === "" || (Number(ejeOD) >= 0 && Number(ejeOD) <= 180);

    // Validaciones para AMBOS - OI
    const esferaOIValida = esferaOI !== "" && Number(esferaOI) >= esferaDesde && Number(esferaOI) <= esferaHasta;
    const cilindroOIValido = cilindroOI !== "" && Math.abs(Number(cilindroOI)) <= Math.abs(cilindroHasta);
    const combinacionOkOI = combinacionValida(esferaOI, cilindroOI);
    const ejeOIValido = ejeOI === "" || (Number(ejeOI) >= 0 && Number(ejeOI) <= 180);

    const puedeAgregar = ojo === "AMBOS"
        ? (esferaOD !== "" && cilindroOD !== "" && esferaODValida && cilindroODValido && combinacionOkOD && ejeODValido &&
            esferaOI !== "" && cilindroOI !== "" && esferaOIValida && cilindroOIValido && combinacionOkOI && ejeOIValido &&
            (!requiereAdicion || (adicionValida(adicionOD) && adicionValida(adicionOI))))
        : (esfera !== "" && cilindro !== "" && esferaValida && cilindroValido && combinacionOkSingle && ejeValidoSingle &&
            (!requiereAdicion || adicionValida(adicion)));

    const handleAgregar = () => {
        setErrorMsg("");

        if (ojo === "AMBOS") {
            if (esferaOD === "" || cilindroOD === "" || esferaOI === "" || cilindroOI === "") {
                setErrorMsg("Completá los campos de esfera y cilindro para ambos ojos.");
                return;
            }
            if (!esferaODValida || !esferaOIValida) {
                const ojoErr = !esferaODValida && !esferaOIValida ? "ambos ojos" : !esferaODValida ? "el ojo derecho" : "el ojo izquierdo";
                setErrorMsg(`⚠️ BLOQUEO TÉCNICO: La esfera de ${ojoErr} está fuera del rango permitido (${esferaDesde.toFixed(2)} a ${esferaHasta.toFixed(2)}). Corregí el valor para continuar.`);
                return;
            }
            if (!cilindroODValido || !cilindroOIValido) {
                setErrorMsg("Error: Cilindro fuera de rango técnico.");
                return;
            }
            if (!combinacionOkOD || !combinacionOkOI) {
                const ojoProblema = !combinacionOkOD && !combinacionOkOI ? "ambos ojos" : !combinacionOkOD ? "el ojo derecho" : "el ojo izquierdo";
                const limitePos = producto.suma_max_pos ? Number(producto.suma_max_pos).toFixed(2) : esferaHasta.toFixed(2);
                const limiteNeg = producto.suma_max_neg ? Number(producto.suma_max_neg).toFixed(2) : esferaDesde.toFixed(2);
                setErrorMsg(`La potencia total (ESF+CIL) de ${ojoProblema} excede el límite del manual (rango total: ${limiteNeg} a +${limitePos}).`);
                return;
            }
            if (!ejeODValido || !ejeOIValido) {
                setErrorMsg("El eje debe estar entre 0° y 180°.");
                return;
            }
            if (requiereAdicion && (!adicionValida(adicionOD) || !adicionValida(adicionOI))) {
                setErrorMsg("Completá la adición (ADD) para ambos ojos. El rango válido es +0.75 a +3.50.");
                return;
            }
        } else {
            if (esfera === "" || cilindro === "") {
                setErrorMsg("Completá los campos de esfera y cilindro.");
                return;
            }
            if (!esferaValida) {
                setErrorMsg(`⚠️ BLOQUEO TÉCNICO: La esfera está fuera del rango permitido para este producto (${esferaDesde.toFixed(2)} a ${esferaHasta.toFixed(2)}).`);
                return;
            }
            if (!cilindroValido) {
                setErrorMsg("Error: Cilindro fuera de rango.");
                return;
            }
            if (!combinacionOkSingle) {
                setErrorMsg(`La combinación ESF + CIL (${(Number(esfera) + Number(cilindro)).toFixed(2)}) excede el rango del producto.`);
                return;
            }
            if (!ejeValidoSingle) {
                setErrorMsg("El eje debe estar entre 0° y 180°.");
                return;
            }
            if (requiereAdicion && !adicionValida(adicion)) {
                setErrorMsg("Completá la adición (ADD). El rango válido es +0.75 a +3.50.");
                return;
            }
        }

        const cart = JSON.parse(localStorage.getItem("cart_extrarango") || "[]");
        if (cart.length >= MAX_ITEMS_CARRITO) {
            setErrorMsg(`El remito permite un máximo de ${MAX_ITEMS_CARRITO} productos. Eliminá un producto del carrito antes de agregar otro.`);
            return;
        }

        setAdding(true);

        const tratamientosData = tratamientosSeleccionadosData.map(t => ({
            id: t.id,
            nombre: t.nombre,
            precio_usd: t.precio_usd,
        }));

        // IMPORTANTE: Para la API y consistencia de pedidos, enviamos el precio UNITARIO (Par / 2)
        const unitPriceUsd = (precioBaseUsd + totalTratamientosUsd) / 2;

        if (ojo === "AMBOS") {
            const cartItem = {
                cartItemId: `${producto.id}_${Date.now()}`,
                productoId: producto.id,
                nombre: producto.nombre + (campoMmOD ? ` (Cam. OD: ${campoMmOD}mm)` : "") + (campoMmOI ? ` (Cam. OI: ${campoMmOI}mm)` : ""),
                material: producto.material,
                linea: producto.linea,
                precioBaseUsd: precioBaseUsd / 2, // Unitario
                ojo: "AMBOS",
                cantidad: 2,
                // Receta OD
                esferaOD: Number(esferaOD),
                cilindroOD: Number(cilindroOD),
                ejeOD: ejeOD ? Number(ejeOD) : null,
                adicionOD: requiereAdicion && adicionOD ? Number(adicionOD) : null,
                prismaOD: prismaOD ? Number(prismaOD) : null,
                ejePrismaOD: ejePrismaOD ? Number(ejePrismaOD) : null,
                // Receta OI
                esferaOI: Number(esferaOI),
                cilindroOI: Number(cilindroOI),
                ejeOI: ejeOI ? Number(ejeOI) : null,
                adicionOI: requiereAdicion && adicionOI ? Number(adicionOI) : null,
                prismaOI: prismaOI ? Number(prismaOI) : null,
                ejePrismaOI: ejePrismaOI ? Number(ejePrismaOI) : null,
                // Armazón
                armazonTransversal: showArmazon && armazonTransversal ? Number(armazonTransversal) : null,
                armazonAltura: showArmazon && armazonAltura ? Number(armazonAltura) : null,
                armazonDiagonal: showArmazon && armazonDiagonal ? Number(armazonDiagonal) : null,
                armazonPuente: showArmazon && armazonPuente ? Number(armazonPuente) : null,
                // Legacy
                esfera: null,
                cilindro: null,
                eje: null,
                adicion: null,
                tratamientos: tratamientosData.map(t => ({ ...t, precio_usd: t.precio_usd / 2 })),
                totalTratamientosUsd: totalTratamientosUsd / 2,
                precioUnitarioUsd: unitPriceUsd,
                totalUsd: unitPriceUsd * 2,
            };
            cart.push(cartItem);
        } else {
            const cartItem = {
                cartItemId: `${producto.id}_${Date.now()}`,
                productoId: producto.id,
                nombre: producto.nombre + (campoMm ? ` (Campo: ${campoMm}mm)` : ""),
                material: producto.material,
                linea: producto.linea,
                precioBaseUsd: precioBaseUsd / 2, // Unitario
                ojo,
                esfera: Number(esfera),
                cilindro: Number(cilindro),
                eje: eje ? Number(eje) : null,
                adicion: requiereAdicion && adicion ? Number(adicion) : null,
                prisma: prisma ? Number(prisma) : null,
                ejePrisma: ejePrisma ? Number(ejePrisma) : null,
                // Armazón
                armazonTransversal: showArmazon && armazonTransversal ? Number(armazonTransversal) : null,
                armazonAltura: showArmazon && armazonAltura ? Number(armazonAltura) : null,
                armazonDiagonal: showArmazon && armazonDiagonal ? Number(armazonDiagonal) : null,
                armazonPuente: showArmazon && armazonPuente ? Number(armazonPuente) : null,
                cantidad: 1,
                tratamientos: tratamientosData.map(t => ({ ...t, precio_usd: t.precio_usd / 2 })),
                totalTratamientosUsd: totalTratamientosUsd / 2,
                precioUnitarioUsd: unitPriceUsd,
                totalUsd: unitPriceUsd,
            };
            cart.push(cartItem);
        }

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
                className="relative bg-white rounded-3xl shadow-2xl w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1F4E79] to-[#2a6da8] px-6 py-5 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Configurar Cristal</p>
                    <h2 className="text-lg sm:text-xl font-black leading-tight pr-4 sm:pr-8">{producto.nombre}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {producto.material && <span className="text-[9px] font-bold bg-white/15 px-2 py-0.5 rounded uppercase">{producto.material}</span>}
                        {producto.linea && <span className="text-[9px] font-bold bg-[#00D1C1]/30 px-2 py-0.5 rounded uppercase">{producto.linea}</span>}
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-black">${(precioBaseUsd * cotizacion).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                        <span className="text-xs text-white/50 font-medium">ARS / par</span>
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
                        <div className="flex flex-col md:flex-row gap-2 text-center">
                            {(["DERECHO", "IZQUIERDO", "AMBOS"] as const).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setOjo(opt)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all border-2 ${ojo === opt
                                        ? "bg-[#1F4E79] text-white border-[#1F4E79] shadow-lg shadow-[#1F4E79]/20"
                                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-[#1F4E79]/30"
                                        }`}
                                >
                                    {opt === "AMBOS" ? "Ambos (par)" : `Ojo ${opt.charAt(0) + opt.slice(1).toLowerCase()}`}
                                </button>
                            ))}
                        </div>
                        {ojo === "AMBOS" && (
                            <p className="text-[10px] text-[#00D1C1] mt-2 font-semibold">
                                ✦ Cargá la receta de cada ojo por separado
                            </p>
                        )}
                    </div>

                    {/* Receta */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">
                            Datos de Receta
                        </label>

                        {ojo === "AMBOS" ? (
                            <div className="space-y-5">
                                <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4">
                                    <CamposReceta
                                        label="Ojo Derecho (OD)"
                                        esferaVal={esferaOD}
                                        setEsferaVal={setEsferaOD}
                                        cilindroVal={cilindroOD}
                                        setCilindroVal={setCilindroOD}
                                        ejeVal={ejeOD}
                                        setEjeVal={setEjeOD}
                                        adicionVal={adicionOD}
                                        setAdicionVal={setAdicionOD}
                                        esferaEsValida={esferaODValida}
                                        cilindroEsValido={cilindroODValido}
                                        combinacionOk={combinacionOkOD}
                                        color="bg-blue-500"
                                        esferaDesde={esferaDesde}
                                        esferaHasta={esferaHasta}
                                        cilindroHasta={cilindroHasta}
                                        requiereAdicion={requiereAdicion}
                                        setErrorMsg={setErrorMsg}
                                        prismaVal={prismaOD}
                                        setPrismaVal={setPrismaOD}
                                        ejePrismaVal={ejePrismaOD}
                                        setEjePrismaVal={setEjePrismaOD}
                                        campoMmVal={campoMmOD}
                                        setCampoMmVal={setCampoMmOD}
                                        producto={producto}
                                    />
                                </div>
                                <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4">
                                    <CamposReceta
                                        label="Ojo Izquierdo (OI)"
                                        esferaVal={esferaOI}
                                        setEsferaVal={setEsferaOI}
                                        cilindroVal={cilindroOI}
                                        setCilindroVal={setCilindroOI}
                                        ejeVal={ejeOI}
                                        setEjeVal={setEjeOI}
                                        adicionVal={adicionOI}
                                        setAdicionVal={setAdicionOI}
                                        esferaEsValida={esferaOIValida}
                                        cilindroEsValido={cilindroOIValido}
                                        combinacionOk={combinacionOkOI}
                                        color="bg-emerald-500"
                                        esferaDesde={esferaDesde}
                                        esferaHasta={esferaHasta}
                                        cilindroHasta={cilindroHasta}
                                        requiereAdicion={requiereAdicion}
                                        setErrorMsg={setErrorMsg}
                                        prismaVal={prismaOI}
                                        setPrismaVal={setPrismaOI}
                                        ejePrismaVal={ejePrismaOI}
                                        setEjePrismaVal={setEjePrismaOI}
                                        campoMmVal={campoMmOI}
                                        setCampoMmVal={setCampoMmOI}
                                        producto={producto}
                                    />
                                </div>
                            </div>
                        ) : (
                            <CamposReceta
                                label={ojo === "DERECHO" ? "Ojo Derecho (OD)" : "Ojo Izquierdo (OI)"}
                                esferaVal={esfera}
                                setEsferaVal={setEsfera}
                                cilindroVal={cilindro}
                                setCilindroVal={setCilindro}
                                ejeVal={eje}
                                setEjeVal={setEje}
                                adicionVal={adicion}
                                setAdicionVal={setAdicion}
                                esferaEsValida={esferaValida}
                                cilindroEsValido={cilindroValido}
                                combinacionOk={combinacionOkSingle}
                                color={ojo === "DERECHO" ? "bg-blue-500" : "bg-emerald-500"}
                                esferaDesde={esferaDesde}
                                esferaHasta={esferaHasta}
                                cilindroHasta={cilindroHasta}
                                requiereAdicion={requiereAdicion}
                                setErrorMsg={setErrorMsg}
                                prismaVal={prisma}
                                setPrismaVal={setPrisma}
                                ejePrismaVal={ejePrisma}
                                setEjePrismaVal={setEjePrisma}
                                campoMmVal={campoMm}
                                setCampoMmVal={setCampoMm}
                                producto={producto}
                            />
                        )}
                    </div>

                    {/* Sección de Armazón */}
                    <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 mt-4">
                        <button 
                            onClick={() => setShowArmazon(!showArmazon)}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${showArmazon ? 'bg-[#1F4E79] text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    <Plus size={14} className={showArmazon ? 'rotate-45 transition-transform' : 'transition-transform'} />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-gray-600">Medidas del Armazón (Opcional)</span>
                            </div>
                            <div className={`w-8 h-4 rounded-full transition-colors relative ${showArmazon ? 'bg-[#00D1C1]' : 'bg-gray-300'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showArmazon ? 'left-4.5' : 'left-0.5'}`} />
                            </div>
                        </button>

                        {showArmazon && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">A (Transv.)</label>
                                    <input 
                                        type="number" 
                                        value={armazonTransversal} 
                                        onChange={(e) => setArmazonTransversal(e.target.value)}
                                        placeholder="cm"
                                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-2 text-xs font-bold focus:ring-2 focus:ring-[#00D1C1] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">B (Altura)</label>
                                    <input 
                                        type="number" 
                                        value={armazonAltura} 
                                        onChange={(e) => setArmazonAltura(e.target.value)}
                                        placeholder="cm"
                                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-2 text-xs font-bold focus:ring-2 focus:ring-[#00D1C1] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">ED (Diag.)</label>
                                    <input 
                                        type="number" 
                                        value={armazonDiagonal} 
                                        onChange={(e) => setArmazonDiagonal(e.target.value)}
                                        placeholder="cm"
                                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-2 text-xs font-bold focus:ring-2 focus:ring-[#00D1C1] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">DBL (Puente)</label>
                                    <input 
                                        type="number" 
                                        value={armazonPuente} 
                                        onChange={(e) => setArmazonPuente(e.target.value)}
                                        placeholder="cm"
                                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-2 text-xs font-bold focus:ring-2 focus:ring-[#00D1C1] outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

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
                                                            <div className="flex flex-col">
                                                                <span className={`text-sm font-bold ${isSelected ? "text-[#1F4E79]" : "text-gray-600"}`}>
                                                                    {t.nombre}
                                                                </span>
                                                                {t.codigo === "REC-SPORTDESING" && (
                                                                    <span className="text-[10px] font-black text-amber-600 uppercase">Consultar Factibilidad</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-sm font-black text-right min-w-[70px] ${isSelected ? "text-[#00D1C1]" : "text-gray-400"}`}>
                                                            {t.codigo === "REC-SPORTDESING" ? "A CONSULTAR" : `+$${precioArs.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}
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
                    <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">
                                {isPair ? "Cristal base (par)" : "Cristal base (unidad - 50% del par)"}
                            </span>
                            <span className="font-bold text-gray-700">${(precioBaseUsd * multiplier * cotizacion).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                        </div>
                        {tratamientosSeleccionadosData.length > 0 && (
                            <div className="flex justify-between items-end gap-2 text-sm border-t border-gray-200 pt-2 pb-2">
                                <span className="text-gray-500 font-medium leading-tight text-xs sm:text-sm">
                                    Tratamientos ({tratamientosSeleccionadosData.length}) {isPair ? "(par)" : "(unidad)"}
                                </span>
                                <span className="font-bold text-[#00D1C1]">+${(totalTratamientosUsd * multiplier * cotizacion).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                            <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Total Estimado</span>
                            <span className="text-2xl font-black text-[#1F4E79]">${totalArs.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold">
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    <button
                        onClick={handleAgregar}
                        disabled={adding}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${!adding
                            ? "bg-[#00D1C1] text-white hover:bg-[#00b8a9] shadow-[#00D1C1]/30"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                            }`}
                    >
                        <ShoppingCart size={18} />
                        {adding ? "¡AGREGADO!" : "Agregar al Pedido"}
                    </button>
                </div>
            </div>
        </div>
    );
}

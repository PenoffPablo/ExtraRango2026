"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X, MessageSquare, Clock, CheckCircle, XCircle, Package, Send, Filter } from "lucide-react";

const ESTADO_COLORS: Record<string, string> = {
    ABIERTO: "bg-amber-100 text-amber-700",
    EN_REVISION: "bg-blue-100 text-blue-700",
    RESUELTO: "bg-green-100 text-green-700",
    CERRADO: "bg-gray-100 text-gray-600",
};

const TIPOS_LABEL: Record<string, string> = {
    PRODUCTO_DEFECTUOSO: "Producto defectuoso",
    RECETA_INCORRECTA: "Receta incorrecta",
    DEMORA_ENVIO: "Demora en envío",
    FACTURACION: "Facturación",
    OTRO: "Otro",
};

export default function AdminReclamosPage() {
    const router = useRouter();
    const [reclamos, setReclamos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReclamo, setSelectedReclamo] = useState<any>(null);
    const [respuesta, setRespuesta] = useState("");
    const [nuevoEstado, setNuevoEstado] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState("TODOS");

    const cargarReclamos = () => {
        fetch("/api/admin/reclamos")
            .then(res => {
                if (res.status === 401) { router.replace("/"); return null; }
                return res.json();
            })
            .then(data => {
                if (data && Array.isArray(data)) setReclamos(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("usuario_extrarango") || "{}");
        if (user.rol !== "ADMIN") {
            router.replace("/");
            return;
        }
        cargarReclamos();
    }, [router]);

    const handleResponder = async () => {
        if (!selectedReclamo || !nuevoEstado) return;
        setProcesando(true);

        try {
            const res = await fetch("/api/admin/reclamos", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedReclamo.id,
                    estado: nuevoEstado,
                    respuesta_admin: respuesta || undefined,
                }),
            });

            if (res.ok) {
                alert("✅ Reclamo actualizado");
                setSelectedReclamo(null);
                setRespuesta("");
                setNuevoEstado("");
                cargarReclamos();
            } else {
                const data = await res.json();
                alert("❌ Error: " + (data.error || "No se pudo actualizar"));
            }
        } catch {
            alert("Error de conexión");
        } finally {
            setProcesando(false);
        }
    };

    const reclamosFiltrados = filtroEstado === "TODOS"
        ? reclamos
        : reclamos.filter(r => r.estado === filtroEstado);

    if (loading) return <div className="pt-32 text-center font-bold text-[#1F4E79] animate-pulse">CARGANDO RECLAMOS...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 px-4 md:px-12 pb-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[#1F4E79] tracking-tighter uppercase">Gestión de Reclamos</h1>
                        <p className="text-gray-500 font-medium text-xs md:text-sm mt-1">{reclamos.length} reclamos totales</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-gray-400" />
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] appearance-none"
                        >
                            <option value="TODOS">Todos</option>
                            <option value="ABIERTO">Abiertos</option>
                            <option value="EN_REVISION">En Revisión</option>
                            <option value="RESUELTO">Resueltos</option>
                            <option value="CERRADO">Cerrados</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 bg-gray-50 py-3 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                        <div className="col-span-1">ID</div>
                        <div className="col-span-3">Cliente</div>
                        <div className="col-span-2">Tipo</div>
                        <div className="col-span-2">Pedido</div>
                        <div className="col-span-2">Estado</div>
                        <div className="col-span-2 text-right">Acción</div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {reclamosFiltrados.map(r => (
                            <div key={r.id} className="grid grid-cols-1 md:grid-cols-12 py-4 px-6 items-center hover:bg-blue-50/20 transition-colors gap-3 md:gap-0">
                                <div className="col-span-1 font-mono font-bold text-[#1F4E79]">#{r.id}</div>
                                <div className="col-span-3">
                                    <p className="font-bold text-gray-800 text-sm">{r.usuarios.nombre} {r.usuarios.apellido}</p>
                                    <p className="text-[10px] text-gray-400">{r.usuarios.email}</p>
                                </div>
                                <div className="col-span-2 text-xs font-bold text-gray-600">{TIPOS_LABEL[r.tipo] || r.tipo}</div>
                                <div className="col-span-2 text-xs text-gray-500">
                                    #{r.pedido_id} · {new Date(r.fecha_creacion).toLocaleDateString('es-AR')}
                                </div>
                                <div className="col-span-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${ESTADO_COLORS[r.estado]}`}>
                                        {r.estado.replace("_", " ")}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <button
                                        onClick={() => { setSelectedReclamo(r); setNuevoEstado(r.estado); setRespuesta(r.respuesta_admin || ""); }}
                                        className="bg-[#1F4E79] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#163a5c] transition-colors inline-flex items-center gap-2"
                                    >
                                        <MessageSquare size={14} /> GESTIONAR
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de Gestión */}
            {selectedReclamo && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="bg-[#1F4E79] p-5 flex justify-between items-start text-white shrink-0">
                            <div>
                                <h3 className="text-lg font-black uppercase flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-amber-400" />
                                    Reclamo #{selectedReclamo.id}
                                </h3>
                                <p className="text-white/70 text-sm mt-1">
                                    {selectedReclamo.usuarios.nombre} {selectedReclamo.usuarios.apellido} · Pedido #{selectedReclamo.pedido_id}
                                </p>
                            </div>
                            <button onClick={() => setSelectedReclamo(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tipo</p>
                                <p className="text-sm font-bold text-gray-700">{TIPOS_LABEL[selectedReclamo.tipo]}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Descripción del Cliente</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReclamo.descripcion}</p>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Cambiar Estado</label>
                                <select
                                    value={nuevoEstado}
                                    onChange={(e) => setNuevoEstado(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] appearance-none"
                                >
                                    <option value="ABIERTO">Abierto</option>
                                    <option value="EN_REVISION">En Revisión</option>
                                    <option value="RESUELTO">Resuelto</option>
                                    <option value="CERRADO">Cerrado</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Respuesta al Cliente</label>
                                <textarea
                                    value={respuesta}
                                    onChange={(e) => setRespuesta(e.target.value)}
                                    placeholder="Escribí tu respuesta..."
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] resize-none"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-5 border-t border-gray-100 flex gap-2 shrink-0">
                            <button onClick={() => setSelectedReclamo(null)} className="flex-1 px-4 py-3 text-gray-500 text-xs font-bold hover:bg-gray-100 rounded-xl transition-colors uppercase">
                                Cancelar
                            </button>
                            <button
                                onClick={handleResponder}
                                disabled={procesando}
                                className="flex-1 bg-[#00D1C1] text-white py-3 rounded-xl text-xs font-black hover:bg-[#00b8a9] transition-colors shadow-lg shadow-[#00D1C1]/20 flex items-center justify-center gap-2 uppercase disabled:opacity-50"
                            >
                                <Send size={14} />
                                {procesando ? "PROCESANDO..." : "GUARDAR"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

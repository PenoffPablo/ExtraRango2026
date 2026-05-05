"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Send, Package, Clock, CheckCircle, XCircle, ChevronDown } from "lucide-react";

const TIPOS_RECLAMO = [
    { value: "PRODUCTO_DEFECTUOSO", label: "Producto defectuoso" },
    { value: "RECETA_INCORRECTA", label: "Receta incorrecta" },
    { value: "DEMORA_ENVIO", label: "Demora en envío" },
    { value: "FACTURACION", label: "Facturación" },
    { value: "OTRO", label: "Otro motivo" },
];

const ESTADO_COLORS: Record<string, string> = {
    ABIERTO: "bg-amber-100 text-amber-700",
    EN_REVISION: "bg-blue-100 text-blue-700",
    RESUELTO: "bg-green-100 text-green-700",
    CERRADO: "bg-gray-100 text-gray-600",
};

const ESTADO_ICONS: Record<string, any> = {
    ABIERTO: Clock,
    EN_REVISION: Package,
    RESUELTO: CheckCircle,
    CERRADO: XCircle,
};

export default function ReclamosPage() {
    const router = useRouter();
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [reclamos, setReclamos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        pedido_id: "",
        tipo: "OTRO",
        descripcion: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("usuario_extrarango");
        if (!storedUser) {
            router.replace("/login");
            return;
        }

        // Cargar pedidos del usuario
        fetch("/api/usuario/pedidos")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPedidos(data);
            })
            .catch(() => {});

        // Cargar reclamos del usuario
        fetch("/api/reclamos")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setReclamos(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.pedido_id) {
            setError("Seleccioná un pedido.");
            return;
        }
        if (formData.descripcion.length < 10) {
            setError("La descripción debe tener al menos 10 caracteres.");
            return;
        }

        setSending(true);
        try {
            const res = await fetch("/api/reclamos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pedido_id: Number(formData.pedido_id),
                    tipo: formData.tipo,
                    descripcion: formData.descripcion,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess("✅ Reclamo enviado correctamente. Te responderemos a la brevedad.");
                setFormData({ pedido_id: "", tipo: "OTRO", descripcion: "" });
                // Recargar reclamos
                const reclamosRes = await fetch("/api/reclamos");
                const reclamosData = await reclamosRes.json();
                if (Array.isArray(reclamosData)) setReclamos(reclamosData);
            } else {
                setError(data.error || "Error al enviar el reclamo.");
            }
        } catch {
            setError("Error de conexión.");
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="pt-32 text-center font-bold text-[#1F4E79] animate-pulse">CARGANDO...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 md:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-[#1F4E79] uppercase tracking-tight">Reclamos</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">Reportá inconvenientes con tus pedidos.</p>
                </div>

                {/* FORMULARIO */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-100">
                        <AlertTriangle className="text-amber-500" size={20} />
                        <h2 className="font-bold text-gray-700 uppercase text-sm">Nuevo Reclamo</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100">
                                ⚠️ {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 text-green-600 text-xs font-bold p-3 rounded-xl border border-green-100">
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Pedido</label>
                                <select
                                    value={formData.pedido_id}
                                    onChange={(e) => setFormData({ ...formData, pedido_id: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] appearance-none"
                                >
                                    <option value="">Seleccionar pedido...</option>
                                    {pedidos.map(p => (
                                        <option key={p.id} value={p.id}>
                                            #{p.id} — {new Date(p.fecha_pedido).toLocaleDateString('es-AR')} — ${Number(p.total_ars).toFixed(0)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Motivo</label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] appearance-none"
                                >
                                    {TIPOS_RECLAMO.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Descripción del problema</label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Describí el inconveniente con el mayor detalle posible..."
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00D1C1] resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="bg-[#1F4E79] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#163a5c] transition-all disabled:opacity-50 shadow-lg shadow-[#1F4E79]/20 uppercase text-sm"
                        >
                            <Send size={16} />
                            {sending ? "ENVIANDO..." : "ENVIAR RECLAMO"}
                        </button>
                    </form>
                </div>

                {/* HISTORIAL DE RECLAMOS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-100">
                        <Package className="text-[#00D1C1]" size={20} />
                        <h2 className="font-bold text-gray-700 uppercase text-sm">Mis Reclamos</h2>
                    </div>

                    {reclamos.length === 0 ? (
                        <div className="text-center py-12 text-gray-300">
                            <AlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium text-gray-400">No tenés reclamos registrados.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reclamos.map((r: any) => {
                                const EstadoIcon = ESTADO_ICONS[r.estado] || Clock;
                                return (
                                    <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-[#1F4E79] text-white text-[10px] font-black px-2 py-1 rounded">
                                                    #{r.id}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-700">
                                                        {TIPOS_RECLAMO.find(t => t.value === r.tipo)?.label || r.tipo}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        Pedido #{r.pedido_id} · {new Date(r.fecha_creacion).toLocaleDateString('es-AR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1 ${ESTADO_COLORS[r.estado]}`}>
                                                <EstadoIcon size={12} />
                                                {r.estado.replace("_", " ")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{r.descripcion}</p>
                                        {r.respuesta_admin && (
                                            <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Respuesta del Laboratorio</p>
                                                <p className="text-sm text-blue-800">{r.respuesta_admin}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search, Eye, X, Phone, User, Calendar, PlusCircle, Ban, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function GestorPedidos() {
    const router = useRouter();
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null);
    const [procesando, setProcesando] = useState(false);

    const cargarPedidos = () => {
        const user = JSON.parse(localStorage.getItem("usuario_extrarango") || "{}");

        fetch("/api/admin/pedidos", {
            headers: { "user-id": user.id }
        })
            .then(res => {
                if (res.status === 401) { router.replace("/"); return null; }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setPedidos(data);
                    setLoading(false);
                }
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("usuario_extrarango") || "{}");
        if (user.rol !== "ADMIN") {
            router.replace("/");
            return;
        }
        cargarPedidos();
    }, [router]);

    const actualizarEstado = async (id: number, nuevoEstado: string) => {
        const estadoLegible = nuevoEstado.replace("_", " ");
        if (!confirm(`¿Confirmar cambio de estado a: ${estadoLegible}?`)) return;

        // Obtenemos usuario
        const user = JSON.parse(localStorage.getItem("usuario_extrarango") || "{}");

        setProcesando(true);
        try {
            const res = await fetch("/api/admin/pedidos", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": user.id
                },
                body: JSON.stringify({ id, estado: nuevoEstado }),
            });

            if (res.ok) {
                alert("✅ Estado actualizado correctamente");
                setPedidoSeleccionado(null);
                cargarPedidos();
            } else {
                const errorData = await res.json();
                alert("❌ Error: " + (errorData.error || "No se pudo actualizar"));
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setProcesando(false);
        }
    };

    if (loading) return <div className="pt-32 text-center font-bold text-[#1F4E79] animate-pulse">CARGANDO GESTOR...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 px-4 md:px-12 pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Header del Gestor */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase">Gestor de Pedidos</h1>
                        <p className="text-gray-500 font-medium text-sm">Panel de administración de laboratorio</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/admin/productos" className="bg-[#00D1C1] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#00b8a9] transition-colors shadow-lg shadow-[#00D1C1]/20">
                            <PlusCircle size={18} />
                            NUEVO PRODUCTO
                        </Link>

                        <div className="bg-white p-2 rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm">
                            <Search size={18} className="text-gray-400 ml-2" />
                            <input type="text" placeholder="Buscar pedido..." className="outline-none text-sm p-1 w-48 bg-transparent" />
                        </div>
                    </div>
                </div>

                {/* Tabla de Pedidos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Total USD</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {pedidos.map((pedido: any) => (
                                <tr key={pedido.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-[#1F4E79]">#{pedido.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{pedido.usuarios.nombre} {pedido.usuarios.apellido}</div>
                                        <div className="text-xs text-gray-400">{pedido.usuarios.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-[#00D1C1]">US$ {Number(pedido.total_usd).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${pedido.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-600' :
                                            pedido.estado === 'CANCELADO' ? 'bg-red-100 text-red-600' :
                                                pedido.estado === 'FINALIZADO' ? 'bg-gray-100 text-gray-600' :
                                                    'bg-green-100 text-green-600'
                                            }`}>
                                            {pedido.estado.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setPedidoSeleccionado(pedido)}
                                            className="bg-[#1F4E79] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#163a5c] transition-colors inline-flex items-center gap-2"
                                        >
                                            <Eye size={14} /> GESTIONAR
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL DE DETALLES --- */}
            {pedidoSeleccionado && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                        <div className="bg-[#1F4E79] p-6 flex justify-between items-start text-white shrink-0">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Package size={20} className="text-[#00D1C1]" />
                                    Pedido #{pedidoSeleccionado.id}
                                </h3>
                                <div className="flex gap-4 mt-2 text-white/80 text-sm">
                                    <p className="flex items-center gap-1"><User size={14} /> {pedidoSeleccionado.usuarios.nombre}</p>
                                    <p className="flex items-center gap-1"><Calendar size={14} /> {new Date(pedidoSeleccionado.fecha_pedido).toLocaleDateString()}</p>
                                </div>
                                {pedidoSeleccionado.usuarios.telefono && (
                                    <p className="text-[#00D1C1] text-xs font-bold mt-1 flex items-center gap-1">
                                        <Phone size={12} /> {pedidoSeleccionado.usuarios.telefono}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setPedidoSeleccionado(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Detalle de Productos</h4>
                            <div className="space-y-4">
                                {pedidoSeleccionado.detalles_pedido.map((detalle: any, index: number) => (
                                    <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-[#1F4E79]">{detalle.productos?.nombre || detalle.nombre_snapshot}</p>
                                            <p className="font-mono font-black text-gray-700">US$ {Number(detalle.precio_unitario_usd).toFixed(2)}</p>
                                        </div>

                                        {/* TABLA DE GRADUACIÓN */}
                                        <div className="grid grid-cols-4 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200 text-center">
                                            <div className="bg-white p-2">
                                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Ojo</span>
                                                <span className="font-black text-[#1F4E79] text-sm">{detalle.ojo}</span>
                                            </div>
                                            <div className="bg-white p-2">
                                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Esfera</span>
                                                <span className="font-medium text-gray-700 text-sm">{detalle.esfera !== null ? detalle.esfera : "-"}</span>
                                            </div>
                                            <div className="bg-white p-2">
                                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Cilindro</span>
                                                <span className="font-medium text-gray-700 text-sm">{detalle.cilindro !== null ? detalle.cilindro : "-"}</span>
                                            </div>
                                            <div className="bg-white p-2">
                                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Eje</span>
                                                <span className="font-medium text-gray-700 text-sm">{detalle.eje !== null ? `${detalle.eje}°` : "-"}</span>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 mt-2">Cantidad: {detalle.cantidad}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PIE DEL MODAL CON ACCIONES */}
                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setPedidoSeleccionado(null)}
                                className="px-5 py-2.5 text-gray-500 text-sm font-bold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                CERRAR
                            </button>

                            {/* --- BOTÓN REMITO --- */}
                            <a
                                href={`/admin/pedidos/remito/${pedidoSeleccionado.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors flex items-center gap-2"
                            >
                                <Package size={16} /> REMITO
                            </a>
                        </div>
                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center shrink-0">
                            <div className="text-xs font-bold text-gray-400">
                                ESTADO: <span className="text-[#1F4E79] uppercase">{pedidoSeleccionado.estado.replace("_", " ")}</span>
                            </div>

                            <div className="flex gap-3">
                                {/* CANCELAR (Disponible si no está finalizado ni cancelado) */}
                                {pedidoSeleccionado.estado !== "CANCELADO" && pedidoSeleccionado.estado !== "FINALIZADO" && (
                                    <button
                                        disabled={procesando}
                                        onClick={() => actualizarEstado(pedidoSeleccionado.id, "CANCELADO")}
                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors flex items-center gap-2"
                                    >
                                        <Ban size={16} /> CANCELAR
                                    </button>
                                )}

                                {/* PENDIENTE -> EN_PROCESO */}
                                {pedidoSeleccionado.estado === "PENDIENTE" && (
                                    <button
                                        disabled={procesando}
                                        onClick={() => actualizarEstado(pedidoSeleccionado.id, "EN_PROCESO")}
                                        className="px-4 py-2 bg-[#00D1C1] text-white rounded-xl text-sm font-bold hover:bg-[#00b8a9] transition-colors shadow-lg shadow-[#00D1C1]/20"
                                    >
                                        MARCAR EN PROCESO
                                    </button>
                                )}

                                {/* EN_PROCESO -> FINALIZADO */}
                                {pedidoSeleccionado.estado === "EN_PROCESO" && (
                                    <button
                                        disabled={procesando}
                                        onClick={() => actualizarEstado(pedidoSeleccionado.id, "FINALIZADO")}
                                        className="px-4 py-2 bg-[#1F4E79] text-white rounded-xl text-sm font-bold hover:bg-[#163a5c] transition-colors shadow-lg shadow-[#1F4E79]/20 flex items-center gap-2"
                                    >
                                        <CheckCircle size={16} /> FINALIZAR PEDIDO
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
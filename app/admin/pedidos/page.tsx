"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search, Eye, X, Phone, User, Calendar, PlusCircle, Ban, CheckCircle, DollarSign } from "lucide-react";
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
                {/* Header del Gestor - Optimizado para Mobile */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                    <div className="w-full">
                        <h1 className="text-2xl md:text-3xl font-black text-[#1F4E79] tracking-tighter uppercase leading-none">Gestor de Pedidos</h1>
                        <p className="text-gray-500 font-medium text-xs md:text-sm mt-1">Panel de administración de laboratorio</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <Link href="/admin/productos" className="w-full sm:w-auto justify-center bg-[#00D1C1] text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#00b8a9] transition-colors shadow-lg shadow-[#00D1C1]/20">
                            <PlusCircle size={18} />
                            NUEVO PRODUCTO
                        </Link>

                        <div className="w-full sm:w-64 bg-white p-2.5 rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm">
                            <Search size={18} className="text-gray-400 ml-2" />
                            <input type="text" placeholder="Buscar pedido..." className="outline-none text-sm w-full bg-transparent" />
                        </div>
                    </div>
                </div>

                {/* VISTA MOBILE: Tarjetas*/}
                <div className="md:hidden space-y-4">
                    {pedidos.map((pedido: any) => (
                        <div key={pedido.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-[#1F4E79] text-white text-[10px] font-black px-2 py-1 rounded">#{pedido.id}</div>
                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${pedido.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-600' :
                                        pedido.estado === 'CANCELADO' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {pedido.estado.replace("_", " ")}
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="font-bold text-gray-800 text-base">{pedido.usuarios.nombre} {pedido.usuarios.apellido}</div>
                                <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Calendar size={12} /> {new Date(pedido.fecha_pedido).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                <div className="font-black text-[#00D1C1] text-lg flex items-center">
                                    <DollarSign size={16} />{Number(pedido.total_usd).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => setPedidoSeleccionado(pedido)}
                                    className="bg-[#1F4E79] text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 uppercase tracking-tight"
                                >
                                    <Eye size={16} /> Gestionar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* VISTA DESKTOP: Tabla (Se oculta en mobile) */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                                                    pedido.estado === 'FINALIZADO' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'
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
            {pedidoSeleccionado && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Cabecera Modal */}
                        <div className="bg-[#1F4E79] p-6 flex justify-between items-start text-white shrink-0">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Package size={20} className="text-[#00D1C1]" />
                                    Pedido #{pedidoSeleccionado.id}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-white/80 text-sm">
                                    <p className="flex items-center gap-1"><User size={14} /> {pedidoSeleccionado.usuarios.nombre}</p>
                                    <p className="flex items-center gap-1"><Calendar size={14} /> {new Date(pedidoSeleccionado.fecha_pedido).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setPedidoSeleccionado(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Contenido Modal */}
                        <div className="p-6 overflow-y-auto">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Detalle de Productos</h4>
                            <div className="space-y-4">
                                {pedidoSeleccionado.detalles_pedido.map((detalle: any, index: number) => (
                                    <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30">
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="font-bold text-[#1F4E79] leading-tight pr-4">{detalle.productos?.nombre || detalle.nombre_snapshot}</p>
                                            <p className="font-mono font-black text-gray-700 whitespace-nowrap text-sm">US$ {Number(detalle.precio_unitario_usd).toFixed(2)}</p>
                                        </div>

                                        <div className="grid grid-cols-4 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200 text-center">
                                            <div className="bg-white p-2">
                                                <span className="block text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-wider">Ojo</span>
                                                <span className="font-black text-[#1F4E79] text-xs md:text-sm">{detalle.ojo}</span>
                                            </div>
                                            <div className="bg-white p-2">
                                                <span className="block text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-wider">Esf.</span>
                                                <span className="font-medium text-gray-700 text-xs md:text-sm">{detalle.esfera !== null ? detalle.esfera : "-"}</span>
                                            </div>
                                            <div className="bg-white p-2">
                                                <span className="block text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-wider">Cil.</span>
                                                <span className="font-medium text-gray-700 text-xs md:text-sm">{detalle.cilindro !== null ? detalle.cilindro : "-"}</span>
                                            </div>
                                            <div className="bg-white p-2">
                                                <span className="block text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-wider">Eje</span>
                                                <span className="font-medium text-gray-700 text-xs md:text-sm">{detalle.eje !== null ? `${detalle.eje}°` : "-"}</span>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Cantidad: {detalle.cantidad}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pie Modal */}
                        <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col gap-4 shrink-0">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-xs font-black text-gray-400 uppercase">
                                    Estado Actual: <span className="text-[#1F4E79] ml-1">{pedidoSeleccionado.estado.replace("_", " ")}</span>
                                </div>
                                <div className="flex w-full sm:w-auto gap-2">
                                    <button onClick={() => setPedidoSeleccionado(null)} className="flex-1 sm:flex-none px-4 py-2 text-gray-500 text-xs font-bold hover:bg-gray-100 rounded-lg transition-colors uppercase">Cerrar</button>
                                    <a href={`/admin/pedidos/remito/${pedidoSeleccionado.id}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 uppercase">
                                        <Package size={14} /> Remito
                                    </a>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                {pedidoSeleccionado.estado !== "CANCELADO" && pedidoSeleccionado.estado !== "FINALIZADO" && (
                                    <button disabled={procesando} onClick={() => actualizarEstado(pedidoSeleccionado.id, "CANCELADO")} className="w-full bg-red-100 text-red-600 py-3 rounded-xl text-xs font-black hover:bg-red-200 transition-colors flex items-center justify-center gap-2 uppercase">
                                        <Ban size={16} /> Cancelar Pedido
                                    </button>
                                )}
                                {pedidoSeleccionado.estado === "PENDIENTE" && (
                                    <button disabled={procesando} onClick={() => actualizarEstado(pedidoSeleccionado.id, "EN_PROCESO")} className="w-full bg-[#00D1C1] text-white py-3 rounded-xl text-xs font-black hover:bg-[#00b8a9] transition-colors shadow-lg shadow-[#00D1C1]/20 uppercase">
                                        Marcar en Proceso
                                    </button>
                                )}
                                {pedidoSeleccionado.estado === "EN_PROCESO" && (
                                    <button disabled={procesando} onClick={() => actualizarEstado(pedidoSeleccionado.id, "FINALIZADO")} className="w-full bg-[#1F4E79] text-white py-3 rounded-xl text-xs font-black hover:bg-[#163a5c] transition-colors shadow-lg shadow-[#1F4E79]/20 flex items-center justify-center gap-2 uppercase">
                                        <CheckCircle size={16} /> Finalizar Pedido
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
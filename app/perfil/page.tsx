"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Save, AlertTriangle, Lock, ShoppingBag, Package, Calendar, DollarSign, XCircle, IdCard } from "lucide-react";

export default function PerfilPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: "",
        cuil: "",
        password: ""
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("usuario_extrarango");
        if (!storedUser) {
            router.replace("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        setFormData({
            nombre: parsedUser.nombre || "",
            apellido: parsedUser.apellido || "",
            telefono: parsedUser.telefono || "",
            cuil: parsedUser.cuil || "",
            password: ""
        });

        // Cargar Historial
        fetch(`/api/usuario/pedidos`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPedidos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error historial:", err);
                setLoading(false);
            });

    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancelarPedido = async (pedidoId: number) => {
        if (!confirm("¿Estás seguro de que quieres dar de baja este pedido?")) return;

        try {
            const res = await fetch(`/api/usuario/pedidos/${pedidoId}/cancelar`, {
                method: "PATCH",
            });

            if (res.ok) {
                alert("Pedido cancelado correctamente.");
                window.location.reload();
            } else {
                const data = await res.json();
                alert(data.error || "No se pudo cancelar el pedido.");
            }
        } catch (error) {
            alert("Error al procesar la cancelación.");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/usuario/perfil", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData }),
            });

            if (!res.ok) throw new Error("Error al actualizar");

            const data = await res.json();
            const updatedUser = { ...user, ...data };
            localStorage.setItem("usuario_extrarango", JSON.stringify(updatedUser));
            setUser(updatedUser);

            alert("✅ Perfil actualizado correctamente");
            setFormData(prev => ({ ...prev, password: "" }));
        } catch (error) {
            alert("Hubo un error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    const handleBaja = async () => {
        if (!confirm("⚠️ ¿Estás seguro? Tu cuenta se desactivará y no podrás acceder.")) return;

        try {
            const res = await fetch(`/api/usuario/perfil`, {
                method: "DELETE",
            });

            if (res.ok) {
                await fetch("/api/auth/logout", { method: "POST" });
                localStorage.removeItem("usuario_extrarango");
                window.dispatchEvent(new Event("userLogin"));
                router.push("/");
            }
        } catch (error) {
            alert("Error al procesar la baja.");
        }
    };

    if (loading) return <div className="pt-32 text-center font-bold text-[#1F4E79] animate-pulse">CARGANDO PERFIL...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* ENCABEZADO */}
                <div>
                    <h1 className="text-3xl font-black text-[#1F4E79] mb-1 uppercase tracking-tight">Mi Perfil</h1>
                    <p className="text-gray-500 font-medium text-sm">Gestiona tus datos personales y revisa tus compras.</p>
                </div>

                <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-6">

                    {/* TARJETA 1: DATOS PERSONALES (Sin Dirección) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-100">
                            <User className="text-[#00D1C1]" size={20} />
                            <h2 className="font-bold text-gray-700 uppercase text-sm">Información de la Cuenta</h2>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                                    <input name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#00D1C1]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Apellido</label>
                                    <input name="apellido" value={formData.apellido} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#00D1C1]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email (No editable)</label>
                                    <input value={user.email} disabled className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 cursor-not-allowed font-medium" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full pl-9 bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#00D1C1]" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">CUIL / CUIT</label>
                                <div className="relative">
                                    <IdCard size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input name="cuil" value={formData.cuil} onChange={handleChange} placeholder="Sin guiones (ej: 20123456789)" className="w-full pl-9 bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold font-mono focus:outline-none focus:border-[#00D1C1]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TARJETA 2: SEGURIDAD */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                            <Lock className="text-gray-400" size={20} />
                            <h2 className="font-bold text-gray-700 uppercase text-sm">Seguridad</h2>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cambiar Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Escribe para cambiar (o deja vacío)"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#00D1C1]"
                            />
                        </div>
                    </div>

                    {/* BOTÓN GUARDAR */}
                    <div className="flex justify-end">
                        <button
                            disabled={saving}
                            className="bg-[#1F4E79] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#163a5c] transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-[#1F4E79]/20"
                        >
                            <Save size={18} />
                            {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                        </button>
                    </div>
                </form>

                {/* HISTORIAL DE PEDIDOS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-100">
                        <ShoppingBag className="text-[#00D1C1]" size={20} />
                        <h2 className="font-bold text-gray-700 uppercase text-sm">Historial de Pedidos</h2>
                    </div>

                    {pedidos.length === 0 ? (
                        <div className="text-center py-12 text-gray-300">
                            <Package size={50} className="mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                            <p className="text-sm font-medium text-gray-400">Aún no has realizado pedidos.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pedidos.map((pedido: any) => (
                                <div key={pedido.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <div className="bg-gray-50/50 p-4 flex flex-wrap justify-between items-center gap-4">

                                        <div className="flex items-center gap-4">
                                            <div className="bg-[#1F4E79] text-white text-[10px] font-black px-2 py-1 rounded">
                                                #{pedido.id}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-white/50 px-2.5 py-1 rounded-lg border border-gray-100 font-bold">
                                                <Calendar size={12} className="text-[#00D1C1]" />
                                                <span className="text-[10px] text-gray-400 uppercase tracking-tighter mr-0.5">Fecha:</span>
                                                {new Date(pedido.fecha_pedido).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </div>
                                            {pedido.estado === "PENDIENTE" && (
                                                <button
                                                    onClick={() => handleCancelarPedido(pedido.id)}
                                                    className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 border border-red-200 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-all ml-2"
                                                >
                                                    <XCircle size={10} /> Cancelar
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-[#1F4E79] font-black">
                                                    <DollarSign size={14} />
                                                    {Number(pedido.total_ars).toFixed(2)}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${pedido.estado === 'COMPLETADO' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {pedido.estado}

                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white">
                                        {pedido.detalles_pedido.map((detalle: any) => (
                                            <div key={detalle.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {detalle.cantidad}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-xs font-bold text-gray-700 leading-tight">{detalle.nombre_snapshot || detalle.productos?.nombre || "Producto"}</p>
                                                        <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                                                            {detalle.ojo && detalle.ojo !== "AMBOS" && (
                                                                <span className="text-[9px] text-[#1F4E79] font-black uppercase bg-[#1F4E79]/10 px-1.5 py-0.5 rounded border border-[#1F4E79]/20">OJO {detalle.ojo}</span>
                                                            )}
                                                            {(detalle.esfera !== null || detalle.cilindro !== null) && (
                                                                <span className="text-[9px] text-gray-600 font-bold uppercase bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                                    ESF: {detalle.esfera !== null ? Number(detalle.esfera).toFixed(2) : "-"} <span className="text-gray-300 font-normal mx-0.5">|</span> CIL: {detalle.cilindro !== null ? Number(detalle.cilindro).toFixed(2) : "-"}
                                                                </span>
                                                            )}
                                                            {detalle.adicion !== null && (
                                                                <span className="text-[9px] text-amber-700 font-bold uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                                    ADD: +{Number(detalle.adicion).toFixed(2)}
                                                                </span>
                                                            )}
                                                            {detalle.prisma !== null && (
                                                                <span className="text-[9px] text-purple-700 font-bold uppercase bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                                                    Prisma: {Number(detalle.prisma).toFixed(2)}Δ {detalle.eje_prisma !== null ? `(B: ${detalle.eje_prisma}°)` : ""}
                                                                </span>
                                                            )}
                                                            {detalle.armazon_transversal !== null && (
                                                                <span className="text-[9px] text-blue-700 font-bold uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex gap-1">
                                                                    <span>Marco:</span>
                                                                    <span className="opacity-70 font-medium">A:{Number(detalle.armazon_transversal)} B:{Number(detalle.armazon_altura)} ED:{Number(detalle.armazon_diagonal)} DBL:{Number(detalle.armazon_puente)}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ZONA DE PELIGRO */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-red-600 font-bold uppercase text-sm flex items-center gap-2">
                                <AlertTriangle size={16} /> Zona de Peligro
                            </h3>
                            <p className="text-xs text-red-400 mt-1 max-w-md font-medium">
                                Si das de baja tu cuenta, no podrás volver a iniciar sesión. Tus pedidos previos quedarán registrados por facturación.
                            </p>
                        </div>
                        <button
                            onClick={handleBaja}
                            className="text-red-500 text-xs font-black border-2 border-red-200 px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all uppercase whitespace-nowrap"
                        >
                            Desactivar Cuenta
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
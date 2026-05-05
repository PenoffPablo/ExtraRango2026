"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Save, AlertTriangle, Lock, ShoppingBag, Package, Calendar, DollarSign, XCircle, IdCard, MapPin, Building2, Copy, CheckCircle, Clock, FileText, Receipt, ChevronDown, ChevronUp } from "lucide-react";
import { CUENTAS_BANCARIAS, type TipoComprobante, DESCUENTO_HORAS_LIMITE, DESCUENTO_ANTICIPADO_PORCENTAJE } from "@/lib/cuentas-bancarias";

export default function PerfilPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedPedido, setExpandedPedido] = useState<number | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [now, setNow] = useState(new Date());

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: "",
        cuil: "",
        codigo_postal: "",
        localidad: "",
        razon_social: "",
        condicion_fiscal: "",
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
            codigo_postal: parsedUser.codigo_postal || "",
            localidad: parsedUser.localidad || "",
            razon_social: parsedUser.razon_social || "",
            condicion_fiscal: parsedUser.condicion_fiscal || "",
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

    // Countdown ticker — actualiza cada minuto
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

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

    const copyToClipboard = async (text: string, fieldId: string) => {
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
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const getCountdown = (fechaPedido: string) => {
        const fecha = new Date(fechaPedido);
        const limite = new Date(fecha.getTime() + DESCUENTO_HORAS_LIMITE * 60 * 60 * 1000);
        const diff = limite.getTime() - now.getTime();
        if (diff <= 0) return null; // Expirado
        const horas = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { horas, minutos };
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

                    {/* TARJETA 1B: DATOS FISCALES Y ENVÍO */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-100">
                            <Building2 className="text-[#00D1C1]" size={20} />
                            <h2 className="font-bold text-gray-700 uppercase text-sm">Datos Fiscales y Envío</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Razón Social</label>
                                    <input name="razon_social" value={formData.razon_social} onChange={handleChange} placeholder="Óptica / Empresa" className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#00D1C1]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Condición Fiscal</label>
                                    <select name="condicion_fiscal" value={formData.condicion_fiscal} onChange={handleChange as any} className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#00D1C1] appearance-none">
                                        <option value="">Seleccionar...</option>
                                        <option value="Responsable Inscripto">Responsable Inscripto</option>
                                        <option value="Monotributo">Monotributo</option>
                                        <option value="Exento">Exento</option>
                                        <option value="Consumidor Final">Consumidor Final</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Localidad</label>
                                    <input name="localidad" value={formData.localidad} onChange={handleChange} placeholder="Tu localidad" className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#00D1C1]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Código Postal</label>
                                    <div className="relative">
                                        <MapPin size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} placeholder="Ej: 5500" className="w-full pl-9 bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold font-mono focus:outline-none focus:border-[#00D1C1]" />
                                    </div>
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
                                                {/* Barra de progreso de pago */}
                                                {(pedido.total_pagado_ars !== null && pedido.total_pagado_ars !== undefined) && (
                                                    <div className="w-20">
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className="bg-[#00D1C1] h-1.5 rounded-full"
                                                                style={{ width: `${Math.min(100, (Number(pedido.total_pagado_ars) / Number(pedido.total_ars)) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[8px] text-gray-400 font-bold">{Math.round((Number(pedido.total_pagado_ars) / Number(pedido.total_ars)) * 100)}% pagado</span>
                                                    </div>
                                                )}
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

                                        {/* SECCIÓN DE PAGO — solo para pedidos pendientes */}
                                        {(pedido.estado === "PENDIENTE" || pedido.estado === "CONFIRMADO") && pedido.tipo_comprobante && (() => {
                                            const cuenta = CUENTAS_BANCARIAS[pedido.tipo_comprobante as TipoComprobante];
                                            const totalBase = Number(pedido.total_ars);
                                            const iva = Number(pedido.monto_iva_ars || 0);
                                            const totalConIva = totalBase + iva;
                                            const pagado = Number(pedido.total_pagado_ars || 0);
                                            const descuento = Number(pedido.descuento_anticipado || 0);
                                            const countdown = getCountdown(pedido.fecha_pedido);
                                            const estaPagado = pagado >= totalConIva;
                                            const isExpanded = expandedPedido === pedido.id;

                                            return (
                                                <div className="mt-3 border-t border-gray-100 pt-3">
                                                    <button
                                                        onClick={() => setExpandedPedido(isExpanded ? null : pedido.id)}
                                                        className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wide text-[#1F4E79] hover:text-[#00D1C1] transition-colors py-1"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <DollarSign size={14} />
                                                            {estaPagado ? "Pago completado ✅" : "Datos para Transferencia"}
                                                        </span>
                                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                                            {/* Countdown */}
                                                            {!estaPagado && countdown && (
                                                                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                                                                    <Clock size={14} className="text-amber-500 shrink-0" />
                                                                    <p className="text-[10px] text-amber-700 font-bold">
                                                                        ⏰ Pagá en las próximas <span className="font-black">{countdown.horas}h {countdown.minutos}m</span> y obtené un <span className="font-black">{Math.round(DESCUENTO_ANTICIPADO_PORCENTAJE * 100)}% de descuento</span>
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {!estaPagado && !countdown && (
                                                                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                                                    <p className="text-[10px] text-gray-500 font-bold">⌛ El plazo para el descuento por pago anticipado ha expirado.</p>
                                                                </div>
                                                            )}

                                                            {/* Monto */}
                                                            <div className="bg-gradient-to-r from-[#1F4E79] to-[#00D1C1] rounded-xl p-3 text-white">
                                                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Monto a transferir</p>
                                                                <p className="text-xl font-black">${totalConIva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                                                {iva > 0 && (
                                                                    <p className="text-[9px] text-white/60">Base: ${totalBase.toLocaleString('es-AR', { minimumFractionDigits: 2 })} + IVA: ${iva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                                                )}
                                                                {countdown && !estaPagado && (
                                                                    <p className="text-[9px] text-amber-200 font-bold mt-1">
                                                                        Con dto. anticipado: ${(totalConIva * (1 - DESCUENTO_ANTICIPADO_PORCENTAJE)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Datos bancarios */}
                                                            {cuenta && !estaPagado && (
                                                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-2">
                                                                    <div className="flex items-center gap-1.5">
                                                                        {pedido.tipo_comprobante === "FACTURA_A" ? <FileText size={12} className="text-[#1F4E79]" /> : <Receipt size={12} className="text-[#00D1C1]" />}
                                                                        <p className="text-[9px] font-black text-gray-400 uppercase">
                                                                            {pedido.tipo_comprobante === "FACTURA_A" ? "Factura A — Procynter SRL" : "Remito — Ricardo Impagliazzo"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                                        <div>
                                                                            <p className="text-gray-400 font-bold uppercase text-[8px]">Titular</p>
                                                                            <p className="font-bold text-gray-700">{cuenta.titular}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-400 font-bold uppercase text-[8px]">Banco</p>
                                                                            <p className="font-bold text-gray-700">{cuenta.banco}</p>
                                                                        </div>
                                                                    </div>
                                                                    {/* CBU copiable */}
                                                                    <div className="bg-white rounded-lg border border-gray-200 px-2.5 py-2">
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <div className="min-w-0">
                                                                                <p className="text-[8px] font-bold text-gray-400 uppercase">CBU</p>
                                                                                <p className="text-[11px] font-black text-[#1F4E79] font-mono break-all leading-relaxed">{cuenta.cbu}</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => copyToClipboard(cuenta.cbu, `cbu-${pedido.id}`)}
                                                                                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black transition-all w-full ${
                                                                                    copiedField === `cbu-${pedido.id}` ? "bg-green-100 text-green-600" : "bg-[#1F4E79]/10 text-[#1F4E79] hover:bg-[#1F4E79]/20"
                                                                                }`}
                                                                            >
                                                                                {copiedField === `cbu-${pedido.id}` ? <><CheckCircle size={10} /> Copiado</> : <><Copy size={10} /> Copiar CBU</>}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    {/* Alias copiable */}
                                                                    <div className="bg-white rounded-lg border border-gray-200 px-2.5 py-2">
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <div className="min-w-0">
                                                                                <p className="text-[8px] font-bold text-gray-400 uppercase">Alias</p>
                                                                                <p className="text-[11px] font-black text-[#00D1C1] break-all">{cuenta.alias}</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => copyToClipboard(cuenta.alias, `alias-${pedido.id}`)}
                                                                                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black transition-all w-full ${
                                                                                    copiedField === `alias-${pedido.id}` ? "bg-green-100 text-green-600" : "bg-[#00D1C1]/10 text-[#00D1C1] hover:bg-[#00D1C1]/20"
                                                                                }`}
                                                                            >
                                                                                {copiedField === `alias-${pedido.id}` ? <><CheckCircle size={10} /> Copiado</> : <><Copy size={10} /> Copiar Alias</>}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {estaPagado && descuento > 0 && (
                                                                <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                                                                    <p className="text-[10px] text-green-700 font-bold">🎉 ¡Descuento por pago anticipado aplicado! Ahorro: ${descuento.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
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
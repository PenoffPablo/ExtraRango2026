"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Package, DollarSign, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function NuevoProductoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nombre: "",
        codigo_sku: "",
        descripcion: "",
        material: "",
        linea: "",
        precio_base_usd: "",
        stock_actual: "0",
        suma_max_pos: "",
        suma_max_neg: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const user = JSON.parse(localStorage.getItem("usuario_extrarango") || "{}");

        try {
            const res = await fetch("/api/admin/productos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": user.id
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Producto creado exitosamente");
                router.push("/admin/pedidos");
            } else {
                alert("Error al crear el producto");
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header con botón volver */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/pedidos" className="p-2 bg-white rounded-full text-gray-500 hover:text-[#1F4E79] shadow-sm transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter">Nuevo Producto</h1>
                        <p className="text-gray-500 text-sm">Ingresa los datos del lente o armazón</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">

                    {/* Sección General */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nombre del Producto *</label>
                            <input name="nombre" required onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00D1C1] font-bold text-[#1F4E79]" placeholder="Ej: Antireflex Blue Cut" />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código SKU</label>
                            <input name="codigo_sku" onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00D1C1]" placeholder="Ej: LENS-001" />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <DollarSign size={12} /> Precio Base USD *
                            </label>
                            <input type="number" step="0.01" name="precio_base_usd" required onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00D1C1] font-mono" placeholder="0.00" />
                        </div>
                    </div>

                    {/* Detalles Técnicos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Material</label>
                            <select name="material" onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00D1C1]">
                                <option value="">Seleccionar...</option>
                                <option value="ORGANICO">Orgánico</option>
                                <option value="MINERAL">Mineral</option>
                                <option value="POLICARBONATO">Policarbonato</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Línea</label>
                            <input name="linea" onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00D1C1]" placeholder="Ej: Premium, Standard" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock Inicial</label>
                            <input type="number" name="stock_actual" onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00D1C1]" defaultValue="0" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
                        <textarea name="descripcion" rows={3} onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00D1C1] text-sm" placeholder="Detalles adicionales del producto..." />
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Límite Suma (+) Manual</label>
                            <input type="number" step="0.25" name="suma_max_pos" onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00D1C1]" placeholder="Ej: +4.00" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Límite Suma (-) Manual</label>
                            <input type="number" step="0.25" name="suma_max_neg" onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00D1C1]" placeholder="Ej: -6.00" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            disabled={loading}
                            className="bg-[#1F4E79] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#163a5c] transition-all shadow-lg shadow-[#1F4E79]/20 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? "GUARDANDO..." : "GUARDAR PRODUCTO"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
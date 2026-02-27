"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, MapPin, Hash, IdCard } from "lucide-react";

export default function RegistroPage() {
    const router = useRouter();
    const [info, setInfo] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        telefono: "",
        cuil: "",
        calle: "",
        numeracion: "",
        departamento: "",
        provincia: "Mendoza"
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await fetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(info),
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error);
            setLoading(false);
            return;
        }

        router.push("/login");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setInfo({ ...info, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-28 pb-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase">
                        Crear Cuenta
                    </h2>
                    <p className="text-gray-400 text-xs font-medium mt-1">Completa tus datos para empezar a operar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    {/* SECCIÓN 1: IDENTIDAD */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                            <User size={14} className="text-[#00D1C1]" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identidad y Contacto</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="nombre" placeholder="Nombre" required onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold" />
                            <input type="text" name="apellido" placeholder="Apellido" required onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold" />
                            <input type="email" name="email" placeholder="Correo Electrónico" required onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold" />
                            <input type="text" name="telefono" placeholder="Teléfono / WhatsApp" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold" />
                            <div className="md:col-span-2 relative">
                                <IdCard size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input type="text" name="cuil" placeholder="CUIL / CUIT (Sin guiones)" onChange={handleChange} className="w-full pl-10 bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold font-mono" />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: DIRECCIÓN DE ENVÍO / REMITO */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                            <MapPin size={14} className="text-[#00D1C1]" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dirección de Entrega</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <input type="text" name="calle" placeholder="Calle" required onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold" />
                            </div>
                            <input type="text" name="numeracion" placeholder="Nro" required onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold" />
                            <input type="text" name="departamento" placeholder="Dpto / Piso" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold" />
                            <select name="provincia" onChange={handleChange} className="md:col-span-2 w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold">
                                <option value="Mendoza">Mendoza</option>
                                <option value="San Juan">San Juan</option>
                                <option value="San Luis">San Luis</option>
                                <option value="Otra">Otra Provincia</option>
                            </select>
                        </div>
                    </div>

                    {/* SECCIÓN 3: SEGURIDAD */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                            <Lock size={14} className="text-[#00D1C1]" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contraseña</span>
                        </div>
                        <input type="password" name="password" placeholder="Crea tu contraseña" required onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-semibold" />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-[#1F4E79] text-white font-black py-4 rounded-2xl hover:bg-[#163A5C] transition-all disabled:opacity-50 mt-4 shadow-xl shadow-[#1F4E79]/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                    >
                        {loading ? "Procesando..." : "Finalizar Registro"}
                    </button>
                </form>
            </div>
        </div>
    );
}
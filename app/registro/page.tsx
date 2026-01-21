"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
    const router = useRouter();
    const [info, setInfo] = useState({ nombre: "", apellido: "", email: "", password: "" });
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

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-black text-[#1F4E79] mb-2 tracking-tighter text-center">
                    CREAR CUENTA
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 mt-8">
                    {error && (
                        <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1]"
                                onChange={(e) => setInfo({ ...info, nombre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Apellido</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1]"
                                onChange={(e) => setInfo({ ...info, apellido: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1]"
                            onChange={(e) => setInfo({ ...info, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1]"
                            onChange={(e) => setInfo({ ...info, password: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-[#1F4E79] text-white font-bold py-4 rounded-xl hover:bg-[#163A5C] transition-colors disabled:opacity-50 mt-4 shadow-lg shadow-[#1F4E79]/20"
                    >
                        {loading ? "GUARDANDO..." : "REGISTRARSE"}
                    </button>
                </form>
            </div>
        </div>
    );
}
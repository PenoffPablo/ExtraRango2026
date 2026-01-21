"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [info, setInfo] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("usuario_extrarango");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.rol === "ADMIN") {
                router.replace("/admin/pedidos");
            } else {
                router.replace("/");
            }
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
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

            localStorage.setItem("usuario_extrarango", JSON.stringify(data));
            window.dispatchEvent(new Event("userLogin"));

            if (data.rol === "ADMIN") {
                router.push("/admin/pedidos");
            } else {
                router.push("/");
            }

        } catch (err) {
            setError("Error de conexión");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-[400px] max-w-sm border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-[#1F4E79] tracking-tighter uppercase">
                        Bienvenido
                    </h2>
                    <p className="text-gray-400 text-xs font-medium mt-1">
                        Ingresa a tu cuenta ExtraRango
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] transition-all"
                            onChange={(e) => setInfo({ ...info, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] transition-all"
                            onChange={(e) => setInfo({ ...info, password: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-[#1F4E79] text-white font-bold py-2 rounded-xl hover:bg-[#163A5C] transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-[#1F4E79]/20 flex items-center justify-center gap-4"
                    >
                        {loading ? "Verificando..." : "INGRESAR"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-xs text-gray-400 mb-2">¿No tienes cuenta?</p>
                    <Link href="/registro" className="text-[#00D1C1] font-bold text-sm hover:underline uppercase tracking-wide">
                        Crear una cuenta
                    </Link>
                </div>
            </div>
        </div>
    );
}
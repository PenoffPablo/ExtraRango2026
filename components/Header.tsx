"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search, LogIn, CircleDollarSign, User, LogOut,
    ShoppingCart, ChevronDown, Trash2, UserCircle, Menu, X,
    ClipboardList
} from "lucide-react";
import CheckoutAction from "./Cart";

export default function Header() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [cotizacion, setCotizacion] = useState<number>(1200);
    const [usuario, setUsuario] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.precio * item.quantity * cotizacion), 0);

    const updateCart = () => {
        const storedCart = JSON.parse(localStorage.getItem("cart_extrarango") || "[]");
        setCartItems(storedCart);
    };

    const handleRemoveItem = (id: number) => {
        const updatedCart = cartItems.filter(item => item.id !== id);
        localStorage.setItem("cart_extrarango", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        async function fetchCotizacion() {
            try {
                const res = await fetch("/api/dolar");
                const data = await res.json();
                if (data.valor) setCotizacion(data.valor);
            } catch (error) {
                console.error("Error obteniendo cotización:", error);
            }
        }
        fetchCotizacion();

        const checkUser = () => {
            const storedUser = localStorage.getItem("usuario_extrarango");
            setUsuario(storedUser ? JSON.parse(storedUser) : null);
        };

        checkUser();
        updateCart();

        window.addEventListener("userLogin", checkUser);
        window.addEventListener("cartUpdated", updateCart);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("userLogin", checkUser);
            window.removeEventListener("cartUpdated", updateCart);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("usuario_extrarango");
        setUsuario(null);
        window.dispatchEvent(new Event("userLogin"));
        router.push("/login");
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
    };

    const headerStyles = scrolled ? "bg-[#1F4E79] py-3 shadow-lg" : "bg-white py-4 md:py-6 border-b border-gray-100";
    const textPrimary = scrolled ? "text-white" : "text-[#1F4E79]";
    const inputStyles = scrolled ? "bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20" : "bg-gray-100 border-gray-200 text-[#1F4E79] placeholder:text-gray-400 focus:bg-white";

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${headerStyles}`}>
            <div className="w-full px-4 md:px-12 lg:px-20 flex items-center justify-between gap-4">
                {/* LOGO Y MENÚ HAMBURGUESA */}
                <div className="flex items-center gap-3 md:gap-0">
                    <button className={`md:hidden p-1 ${scrolled ? "text-white" : "text-[#1F4E79]"}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                    <Link href="/" className="group flex items-center gap-2 shrink-0">
                        <span className={`text-2xl md:text-3xl font-black tracking-tighter transition-colors ${textPrimary}`}>EXTRARANGO</span>
                    </Link>
                </div>

                {/* BUSCADOR DESKTOP */}
                <div className="hidden md:flex flex-1 max-w-2xl relative mx-4">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${scrolled ? "text-white/70" : "text-[#1F4E79]"}`} size={18} />
                    <input type="text" placeholder="Buscar por material, índice o línea..." className={`w-full border rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all ${inputStyles}`} />
                </div>

                {/* ICONOS DERECHA */}
                <div className="flex items-center gap-3 lg:gap-6 shrink-0">
                    {/* DÓLAR INDICATOR */}
                    <div className={`hidden sm:flex flex-col items-end border-r pr-6 ${scrolled ? "border-white/20" : "border-gray-200"}`}>
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${scrolled ? "text-white/60" : "text-zinc-500"}`}>Dólar Ref.</span>
                        <div className={`flex items-center gap-1 font-mono font-bold ${scrolled ? "text-emerald-300" : "text-emerald-600"}`}>
                            <CircleDollarSign size={14} />
                            <span>${cotizacion.toLocaleString('es-AR')}</span>
                        </div>
                    </div>

                    {/* CARRITO */}
                    <div className="relative">
                        <button onClick={() => setIsCartOpen(!isCartOpen)} className={`relative p-2 transition-colors ${scrolled ? "text-white hover:text-white/80" : "text-gray-600 hover:text-[#1F4E79]"}`}>
                            <ShoppingCart size={24} />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full transform translate-x-1/4 -translate-y-1/4">{totalItems}</span>
                            )}
                        </button>

                        {isCartOpen && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden text-gray-900">
                                <div className="p-4">
                                    <h3 className="font-bold border-b pb-2 mb-3 text-sm flex justify-between">
                                        <span>Tu Pedido</span>
                                        <span className="text-xs text-gray-400 font-normal">USD ref: ${cotizacion}</span>
                                    </h3>
                                    {cartItems.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">El carrito está vacío</p>
                                    ) : (
                                        <div className="max-h-60 overflow-y-auto space-y-3">
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="flex justify-between items-start text-sm group">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-[#1F4E79] truncate">{item.nombre}</p>
                                                        <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="font-bold text-[#00D1C1]">
                                                            ${(item.precio * item.quantity * cotizacion).toLocaleString('es-AR')}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="border-t border-gray-100 mt-3 pt-3 bg-gray-50 -mx-4 px-4 pb-2">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-sm font-bold text-gray-600 uppercase">Total Estimado:</span>
                                                    <span className="text-xl font-black text-[#1F4E79]">
                                                        ${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <CheckoutAction />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PERFIL DESKTOP */}
                    <div className="hidden md:block relative">
                        {usuario ? (
                            <div>
                                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-2 text-sm font-bold transition-colors focus:outline-none ${textPrimary}`}>
                                    <div className="p-1.5 bg-[#00D1C1]/20 rounded-full text-[#00D1C1]"><User size={16} /></div>
                                    <span className="uppercase truncate max-w-[100px]">{usuario.nombre}</span>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-1 text-gray-700">
                                        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">MI CUENTA</p>
                                            <p className="text-base font-bold text-[#1F4E79] truncate mt-1">{usuario.nombre}</p>
                                            {usuario.rol === "ADMIN" && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase">Administrador</span>
                                            )}
                                        </div>
                                        <div className="p-2 flex flex-col gap-1">
                                            {usuario.rol === "ADMIN" && (
                                                <Link href="/admin/pedidos" onClick={() => setIsProfileOpen(false)} className="group flex items-center w-full px-4 py-3 text-sm font-bold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all gap-3 mb-1">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-amber-600 shadow-sm border border-amber-100"><ClipboardList size={18} /></div>
                                                    <span className="whitespace-nowrap">Gestor de Pedidos</span>
                                                </Link>
                                            )}
                                            <Link href="/perfil" onClick={() => setIsProfileOpen(false)} className="group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors shrink-0"><UserCircle size={18} /></div>
                                                <span className="whitespace-nowrap">Ver perfil</span>
                                            </Link>
                                            <button onClick={handleLogout} className="group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-700 transition-all gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 group-hover:bg-red-200 group-hover:text-red-700 transition-colors shrink-0"><LogOut size={18} /></div>
                                                <span className="whitespace-nowrap">Cerrar sesión</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${scrolled ? "bg-white text-[#1F4E79]" : "bg-[#1F4E79] text-white"}`}>
                                    <span>Entrar</span><LogIn size={16} />
                                </Link>
                                <Link href="/registro" className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${scrolled ? "border-white/30 text-white" : "border-[#1F4E79] text-[#1F4E79]"}`}>Registrarse</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 p-5 flex flex-col gap-6 md:hidden animate-in slide-in-from-top-5 duration-200 h-[calc(100vh-70px)] overflow-y-auto">

                    {/* Buscador Móvil */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] text-gray-900"
                        />
                    </div>

                    {/* Cotización Móvil */}
                    <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Cotización Dólar</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-600">
                            <CircleDollarSign size={16} />
                            <span>${cotizacion.toLocaleString('es-AR')}</span>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Modelo mobile */}
                    {usuario ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 mb-2 text-gray-900">
                                <div className="w-10 h-10 rounded-full bg-[#1F4E79] text-white flex items-center justify-center font-bold text-lg">
                                    {usuario.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-[#1F4E79]">{usuario.nombre}</p>
                                    <p className="text-xs text-gray-500">Sesión activa</p>
                                </div>
                            </div>

                            {usuario.rol === "ADMIN" && (
                                <Link
                                    href="/admin/pedidos"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 border border-amber-100"
                                >
                                    <ClipboardList size={20} />
                                    <span>Gestor de Pedidos</span>
                                </Link>
                            )}

                            <Link
                                href="/perfil"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-gray-100"
                            >
                                <UserCircle size={20} />
                                <span>Mi Perfil</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 mt-2"
                            >
                                <LogOut size={20} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-3 bg-[#1F4E79] text-white text-center font-bold rounded-xl shadow-lg"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/registro"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-3 border-2 border-[#1F4E79] text-[#1F4E79] text-center font-bold rounded-xl"
                            >
                                Crear Cuenta
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
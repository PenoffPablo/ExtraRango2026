"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search, LogIn, CircleDollarSign, User, LogOut,
    ShoppingCart, ChevronDown, Trash2, UserCircle, Menu, X,
    ClipboardList, AlertTriangle
} from "lucide-react";
import CheckoutAction from "./Cart";
import SuccessModal from "./SuccessModal";
import CheckoutConfirmModal from "./CheckoutConfirmModal";
import type { TipoComprobante } from "@/lib/cuentas-bancarias";

export default function Header() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [cotizacion, setCotizacion] = useState<number>(1200);
    const [usuario, setUsuario] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastOrderId, setLastOrderId] = useState("");
    const [lastTipoComprobante, setLastTipoComprobante] = useState<string | undefined>(undefined);
    const [lastTotalArs, setLastTotalArs] = useState<number | undefined>(undefined);
    const [lastMontoIvaArs, setLastMontoIvaArs] = useState<number | undefined>(undefined);
    const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
    const [checkoutTipoComprobante, setCheckoutTipoComprobante] = useState<TipoComprobante>("REMITO");
    const [checkoutMetodoEnvio, setCheckoutMetodoEnvio] = useState<string>("");

    const totalItems = cartItems.reduce((acc, item) => acc + (item.cantidad || item.quantity || 1), 0);
    const totalAmount = cartItems.reduce((acc, item) => {
        if (item.totalUsd) return acc + (item.totalUsd * cotizacion);
        return acc + ((item.precio || 0) * (item.quantity || 1) * cotizacion);
    }, 0);

    const updateCart = () => {
        const storedCart = JSON.parse(localStorage.getItem("cart_extrarango") || "[]");
        setCartItems(storedCart);
    };

    const handleRemoveItem = (cartItemId: string | number) => {
        const updatedCart = cartItems.filter(item => (item.cartItemId || item.id) !== cartItemId);
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

        const handleOrderSuccess = (e: any) => {
            setLastOrderId(e.detail.pedidoId);
            setLastTipoComprobante(e.detail.tipoComprobante);
            setLastTotalArs(e.detail.totalArs);
            setLastMontoIvaArs(e.detail.montoIvaArs);
            setShowSuccess(true);
            setIsCartOpen(false);
            setShowCheckoutConfirm(false);
        };

        const handleCheckoutPreview = (e: any) => {
            setCheckoutTipoComprobante(e.detail.tipoComprobante);
            setCheckoutMetodoEnvio(e.detail.metodoEnvio);
            setIsCartOpen(false);
            setShowCheckoutConfirm(true);
        };

        window.addEventListener("userLogin", checkUser);
        window.addEventListener("cartUpdated", updateCart);
        window.addEventListener("orderSuccess", handleOrderSuccess);
        window.addEventListener("checkoutPreview", handleCheckoutPreview);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("userLogin", checkUser);
            window.removeEventListener("cartUpdated", updateCart);
            window.removeEventListener("orderSuccess", handleOrderSuccess);
            window.removeEventListener("checkoutPreview", handleCheckoutPreview);
        };
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("usuario_extrarango");
        localStorage.removeItem("cart_extrarango");
        setUsuario(null);
        window.dispatchEvent(new Event("userLogin"));
        window.dispatchEvent(new Event("cartUpdated"));
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
                        <span className={`text-2xl md:text-3xl font-black tracking-tighter transition-colors ${textPrimary}`}>EXTRA-RANGO</span>
                    </Link>
                </div>

                {/* BUSCADOR DESKTOP 
                <div className="hidden md:flex flex-1 max-w-2xl relative mx-4">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${scrolled ? "text-white/70" : "text-[#1F4E79]"}`} size={18} />
                    <input type="text" placeholder="Buscar por material, índice o línea..." className={`w-full border rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all ${inputStyles}`} />
                </div>*/}

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
                            <div className="fixed inset-x-0 bottom-0 top-auto md:absolute md:inset-auto md:right-0 md:top-full mt-0 md:mt-3 w-full md:w-[420px] bg-white rounded-t-2xl md:rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden text-gray-900 max-h-[85vh] md:max-h-none">
                                <div className="p-5">
                                    <h3 className="font-black border-b pb-3 mb-4 text-sm flex justify-between items-center">
                                        <span className="uppercase tracking-wide text-[#1F4E79]">Tu Pedido</span>
                                        <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-lg">USD ref: ${cotizacion}</span>
                                    </h3>
                                    {cartItems.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-6">El carrito está vacío</p>
                                    ) : (
                                        <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
                                            {cartItems.map((item, idx) => {
                                                const itemKey = item.cartItemId || item.id || idx;
                                                const itemTotal = item.totalUsd
                                                    ? item.totalUsd * cotizacion
                                                    : (item.precio || 0) * (item.quantity || 1) * cotizacion;
                                                return (
                                                    <div key={itemKey} className="flex justify-between items-start text-sm group border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                                        <div className="flex-1 min-w-0 pr-3">
                                                            <p className="font-bold text-[#1F4E79] text-[13px] leading-snug">{item.nombre}</p>
                                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                                {item.ojo && (
                                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${item.ojo === "AMBOS" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                                                                        {item.ojo === "AMBOS" ? "PAR" : `UNIDAD (${item.ojo})`}
                                                                    </span>
                                                                )}
                                                                {/* Recetas separadas por ojo (AMBOS) */}
                                                                {item.ojo === "AMBOS" && item.esferaOD !== undefined ? (
                                                                    <div className="w-full flex flex-col gap-0.5 mt-1">
                                                                        <span className="text-[10px] font-medium text-gray-400">
                                                                            <span className="font-bold text-blue-500">OD:</span> ESF:{item.esferaOD >= 0 ? `+${item.esferaOD}` : item.esferaOD} CIL:{item.cilindroOD >= 0 ? `+${item.cilindroOD}` : item.cilindroOD}{item.adicionOD ? ` ADD:+${item.adicionOD}` : ''}
                                                                        </span>
                                                                        <span className="text-[10px] font-medium text-gray-400">
                                                                            <span className="font-bold text-emerald-500">OI:</span> ESF:{item.esferaOI >= 0 ? `+${item.esferaOI}` : item.esferaOI} CIL:{item.cilindroOI >= 0 ? `+${item.cilindroOI}` : item.cilindroOI}{item.adicionOI ? ` ADD:+${item.adicionOI}` : ''}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {item.esfera !== undefined && item.esfera !== null && (
                                                                            <span className="text-[10px] font-medium text-gray-400">
                                                                                ESF:{item.esfera >= 0 ? `+${item.esfera}` : item.esfera}
                                                                            </span>
                                                                        )}
                                                                        {item.cilindro !== undefined && item.cilindro !== null && (
                                                                            <span className="text-[10px] font-medium text-gray-400">
                                                                                CIL:{item.cilindro >= 0 ? `+${item.cilindro}` : item.cilindro}
                                                                            </span>
                                                                        )}
                                                                        {item.adicion !== undefined && item.adicion !== null && (
                                                                            <span className="text-[10px] font-medium text-amber-500">
                                                                                ADD:+{item.adicion}
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            {item.tratamientos && item.tratamientos.length > 0 && (
                                                                <p className="text-[10px] text-[#00D1C1] font-medium mt-1">
                                                                    +{item.tratamientos.length} tratamiento{item.tratamientos.length > 1 ? 's' : ''}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                            <span className="font-black text-[#00D1C1] text-sm">
                                                                ${itemTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                            <button onClick={() => handleRemoveItem(itemKey)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div className="border-t border-gray-100 mt-4 pt-4 bg-gray-50/80 -mx-5 px-5 pb-3 rounded-b-2xl">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-sm font-bold text-gray-600 uppercase">Total Estimado:</span>
                                                    <span className="text-2xl font-black text-[#1F4E79]">
                                                        ${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <CheckoutAction />
                                                <p className="text-[9px] text-gray-400 text-center mt-2">Precios sin impuestos. Pago anticipado (24hs): 10% dto.</p>
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
                                                <>
                                                <Link href="/admin/pedidos" onClick={() => setIsProfileOpen(false)} className="group flex items-center w-full px-4 py-3 text-sm font-bold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all gap-3 mb-1">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-amber-600 shadow-sm border border-amber-100"><ClipboardList size={18} /></div>
                                                    <span className="whitespace-nowrap">Gestor de Pedidos</span>
                                                </Link>
                                                <Link href="/admin/reclamos" onClick={() => setIsProfileOpen(false)} className="group flex items-center w-full px-4 py-3 text-sm font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all gap-3 mb-1">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-600 shadow-sm border border-red-100"><AlertTriangle size={18} /></div>
                                                    <span className="whitespace-nowrap">Gestión Reclamos</span>
                                                </Link>
                                                </>
                                            )}
                                            <Link href="/perfil" onClick={() => setIsProfileOpen(false)} className="group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors shrink-0"><UserCircle size={18} /></div>
                                                <span className="whitespace-nowrap">Ver perfil</span>
                                            </Link>
                                            <Link href="/reclamos" onClick={() => setIsProfileOpen(false)} className="group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-all gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 group-hover:bg-amber-200 group-hover:text-amber-700 transition-colors shrink-0"><AlertTriangle size={18} /></div>
                                                <span className="whitespace-nowrap">Reclamos</span>
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

                            <Link
                                href="/reclamos"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 border border-amber-100"
                            >
                                <AlertTriangle size={20} />
                                <span>Reclamos</span>
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

            {showCheckoutConfirm && (
                <CheckoutConfirmModal
                    tipoComprobante={checkoutTipoComprobante}
                    metodoEnvio={checkoutMetodoEnvio}
                    onClose={() => setShowCheckoutConfirm(false)}
                />
            )}

            {showSuccess && (
                <SuccessModal
                    pedidoId={lastOrderId}
                    tipoComprobante={lastTipoComprobante as any}
                    totalArs={lastTotalArs}
                    montoIvaArs={lastMontoIvaArs}
                    onClose={() => setShowSuccess(false)}
                />
            )}
        </header>
    );
}
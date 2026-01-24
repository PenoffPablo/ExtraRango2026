"use client";

import { useState, useMemo } from "react";
import { Search, X, ShoppingCart } from "lucide-react";

type ProductoSerializado = {
    id: number;
    codigo_sku: string | null;
    nombre: string;
    descripcion: string | null;
    material: string | null;
    linea: string | null;
    indice_refraccion: string | null;
    rango_dioptrias: string | null;
    precio_base_usd: string;
    precio_ars?: string;
    stock_actual: number | null;
    imagen_url: string | null;
    estado: boolean | null;
};

interface HeroProps {
    productos: ProductoSerializado[];
}

export default function Hero({ productos }: HeroProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLinea, setSelectedLinea] = useState<string>("all");
    const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");

    const lineas = useMemo(() => [...new Set(productos.map(p => p.linea).filter(Boolean))].sort(), [productos]);
    const materiales = useMemo(() => [...new Set(productos.map(p => p.material).filter(Boolean))].sort(), [productos]);

    const productosFiltrados = useMemo(() => {
        return productos.filter(producto => {
            const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLinea = selectedLinea === "all" || producto.linea === selectedLinea;
            const matchesMaterial = selectedMaterial === "all" || producto.material === selectedMaterial;
            const precio = Number(producto.precio_base_usd);
            const min = minPrice ? Number(minPrice) : 0;
            const max = maxPrice ? Number(maxPrice) : Infinity;
            const matchesPrice = precio >= min && precio <= max;

            return matchesSearch && matchesLinea && matchesMaterial && matchesPrice;
        });
    }, [productos, searchTerm, selectedLinea, selectedMaterial, minPrice, maxPrice]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedLinea("all");
        setSelectedMaterial("all");
        setMinPrice("");
        setMaxPrice("");
    };

    const hasActiveFilters = searchTerm || selectedLinea !== "all" || selectedMaterial !== "all" || minPrice || maxPrice;

    return (
        <section className="min-h-screen bg-white text-black pt-32 pb-20">
            <div className="w-full px-4 md:px-12 lg:px-20">
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-black tracking-tighter mb-2 uppercase text-[#1F4E79]">
                        Catálogo Digital
                    </h1>
                    <div className="h-1.5 w-32 bg-[#00D1C1] rounded-full mx-auto"></div>
                </div>

                {/* FILTROS */}
                <div className="mb-8 bg-gray-50/50 border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                        <div className="relative">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Buscador</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar producto..."
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Línea</label>
                            <select
                                value={selectedLinea}
                                onChange={(e) => setSelectedLinea(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-bold appearance-none"
                            >
                                <option value="all">Todas</option>
                                {lineas.map(linea => <option key={linea} value={linea!}>{linea}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Material</label>
                            <select
                                value={selectedMaterial}
                                onChange={(e) => setSelectedMaterial(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-bold appearance-none"
                            >
                                <option value="all">Todos</option>
                                {materiales.map(m => <option key={m} value={m!}>{m}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Rango Precio (USD)</label>
                            <div className="flex gap-2">
                                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="w-1/2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1]" />
                                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="w-1/2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1]" />
                            </div>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs font-black text-red-400 flex items-center gap-1 hover:text-red-500 uppercase">
                            <X size={14} /> Limpiar Filtros
                        </button>
                    )}
                </div>

                {/* TABLA DE PRODUCTOS */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 bg-gray-50 py-4 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                        <div className="col-span-6">Producto / Descripción</div>
                        <div className="col-span-3 text-right">Precio ARS</div>
                        <div className="col-span-3 text-right">Acción</div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {productosFiltrados.map((p) => (
                            <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 py-6 px-8 items-center hover:bg-blue-50/10 transition-colors gap-4 md:gap-0">
                                <div className="col-span-6">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-black text-[#1F4E79] uppercase leading-tight">
                                            {p.nombre}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {p.linea && <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">{p.linea}</span>}
                                            {p.material && <span className="text-[9px] font-black bg-[#00D1C1]/10 text-[#00D1C1] px-2 py-0.5 rounded uppercase">{p.material}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* PRECIO*/}
                                <div className="col-span-3 text-right">
                                    <div className="text-2xl font-black text-[#00D1C1] tracking-tighter">
                                        ${p.precio_ars || "Consultar"}
                                    </div>
                                </div>

                                <div className="col-span-3 text-right">
                                    <button
                                        onClick={() => {
                                            const item = { id: p.id, nombre: p.nombre, precio: Number(p.precio_base_usd), quantity: 1 };
                                            const cart = JSON.parse(localStorage.getItem("cart_extrarango") || "[]");
                                            const idx = cart.findIndex((i: any) => i.id === p.id);
                                            if (idx > -1) cart[idx].quantity += 1;
                                            else cart.push(item);
                                            localStorage.setItem("cart_extrarango", JSON.stringify(cart));
                                            window.dispatchEvent(new Event("cartUpdated"));
                                        }}
                                        className="inline-flex items-center justify-center gap-2 bg-[#1F4E79] text-white px-6 py-3 rounded-2xl text-[11px] font-black hover:bg-[#163a5c] transition-all active:scale-95 shadow-lg shadow-[#1F4E79]/20 uppercase w-full md:w-auto"
                                    >
                                        <ShoppingCart size={16} />
                                        Añadir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
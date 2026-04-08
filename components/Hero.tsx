"use client";

import { useState, useMemo } from "react";
import { Search, X, ShoppingCart } from "lucide-react";
import RecetaModal from "./RecetaModal";

type ProductoSerializado = {
    id: number;
    codigo_sku: string | null;
    nombre: string;
    descripcion: string | null;
    material: string | null;
    linea: string | null;
    indice_refraccion: string | null;
    rango_dioptrias: string | null;
    esfera_desde: string | null;
    esfera_hasta: string | null;
    cilindro_hasta: string | null;
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
    const [sortBy, setSortBy] = useState<string>("all");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [productoModal, setProductoModal] = useState<ProductoSerializado | null>(null);
    const PAGE_SIZE = 10;

    const getCategoriaLinea = (linea: string | null) => {
        if (!linea) return "Otros";
        const lower = linea.toLowerCase();
        if (lower.includes("stock")) return "Stock";
        if (lower.includes("laboratorio")) return "Laboratorio Digital";
        if (lower.includes("bifocal")) return "Bifocales";
        if (lower.includes("multifocal")) return "Multifocales";
        if (lower.includes("especialidad") || lower.includes("baja visión") || lower.includes("hipermetropía")) return "Especialidades";
        return "Otros";
    };

    const categoriasLineas = useMemo(() => {
        const categoriasPresentes = new Set<string>(productos.map(p => getCategoriaLinea(p.linea)));

        const ordenDeseado: string[] = [
            "Stock",
            "Laboratorio Digital",
            "Bifocales",
            "Multifocales",
            "Especialidades",
            "Otros"
        ];

        return ordenDeseado.filter(cat => categoriasPresentes.has(cat));
    }, [productos]);

    const productosFiltrados = useMemo(() => {
        let filtered = productos.filter(producto => {
            const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLinea = selectedLinea === "all" || getCategoriaLinea(producto.linea) === selectedLinea;
            const precio = Number(producto.precio_base_usd);
            const min = minPrice ? Number(minPrice) : 0;
            const max = maxPrice ? Number(maxPrice) : Infinity;
            const matchesPrice = precio >= min && precio <= max;

            return matchesSearch && matchesLinea && matchesPrice;
        });

        if (sortBy === "precio-asc") {
            filtered = [...filtered].sort((a, b) => Number(a.precio_base_usd) - Number(b.precio_base_usd));
        } else if (sortBy === "precio-desc") {
            filtered = [...filtered].sort((a, b) => Number(b.precio_base_usd) - Number(a.precio_base_usd));
        }

        return filtered;
    }, [productos, searchTerm, selectedLinea, sortBy, minPrice, maxPrice]);

    const totalPages = Math.ceil(productosFiltrados.length / PAGE_SIZE);
    const productosPaginados = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return productosFiltrados.slice(start, start + PAGE_SIZE);
    }, [productosFiltrados, currentPage]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedLinea("all");
        setSortBy("all");
        setMinPrice("");
        setMaxPrice("");
        setCurrentPage(1);
    };

    const hasActiveFilters = searchTerm || selectedLinea !== "all" || sortBy !== "all" || minPrice || maxPrice;

    return (
        <section className="min-h-screen bg-white text-black pt-32 pb-32">
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
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    placeholder="Buscar producto..."
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Línea</label>
                            <select
                                value={selectedLinea}
                                onChange={(e) => { setSelectedLinea(e.target.value); setCurrentPage(1); }}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-bold appearance-none"
                            >
                                <option value="all">Todas</option>
                                {categoriasLineas.map(categoria => (
                                    <option key={categoria} value={categoria}>{categoria}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Filtros</label>
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00D1C1] text-sm font-bold appearance-none"
                            >
                                <option value="all">Predeterminado</option>
                                <option value="mas-vendidos">Más vendidos</option>
                                <option value="precio-asc">Precio (Menor a Mayor)</option>
                                <option value="precio-desc">Precio (Mayor a Menor)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Rango Precio (USD)</label>
                            <div className="flex gap-2">
                                <input type="number" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }} placeholder="Min" className="w-1/2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1]" />
                                <input type="number" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }} placeholder="Max" className="w-1/2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D1C1]" />
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
                        {productosPaginados.map((p) => (
                            <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 py-6 px-8 items-center hover:bg-blue-50/10 transition-colors gap-4 md:gap-0">
                                <div className="col-span-5">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-black text-[#1F4E79] uppercase leading-tight">
                                            {p.nombre}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {p.linea && <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">{p.linea}</span>}
                                            {p.material && <span className="text-[9px] font-black bg-[#00D1C1]/10 text-[#00D1C1] px-2 py-0.5 rounded uppercase">{p.material}</span>}
                                        </div>
                                        {/* Rango del cristal */}
                                        <div className="flex flex-wrap gap-3 mt-2 text-[9px] font-bold text-gray-400">
                                            {p.esfera_desde && p.esfera_hasta && (
                                                <span>ESF: {Number(p.esfera_desde).toFixed(2)} a {Number(p.esfera_hasta) >= 0 ? '+' : ''}{Number(p.esfera_hasta).toFixed(2)}</span>
                                            )}
                                            {p.cilindro_hasta && (
                                                <span>CIL: hasta {Number(p.cilindro_hasta).toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* PRECIO*/}
                                <div className="col-span-4 text-right">
                                    <div className="text-2xl font-black text-[#00D1C1] tracking-tighter">
                                        ${p.precio_ars || "Consultar"}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">precio base / par</p>
                                </div>

                                <div className="col-span-3 text-right">
                                    <button
                                        onClick={() => setProductoModal(p)}
                                        className="inline-flex items-center justify-center gap-2 bg-[#1F4E79] text-white px-6 py-3 rounded-2xl text-[11px] font-black hover:bg-[#163a5c] transition-all active:scale-95 shadow-lg shadow-[#1F4E79]/20 uppercase w-full md:w-auto"
                                    >
                                        <ShoppingCart size={16} />
                                        Cotizar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-4 mt-10">
                        <p className="text-xs font-bold text-gray-400">
                            Página {currentPage} de {totalPages} — {productosFiltrados.length} productos
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={currentPage === 1}
                                className="px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase border border-gray-200 bg-white text-[#1F4E79] hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                ← Anterior
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className={`w-10 h-10 rounded-2xl text-[11px] font-black transition-all ${page === currentPage
                                        ? "bg-[#1F4E79] text-white shadow-lg shadow-[#1F4E79]/20 scale-110"
                                        : "bg-white border border-gray-200 text-[#1F4E79] hover:bg-blue-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={currentPage === totalPages}
                                className="px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase border border-gray-200 bg-white text-[#1F4E79] hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Receta */}
            {productoModal && (
                <RecetaModal
                    producto={productoModal}
                    onClose={() => setProductoModal(null)}
                />
            )}
        </section>
    );
}
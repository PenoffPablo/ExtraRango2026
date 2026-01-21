"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { ShoppingCart } from "lucide-react";

// Tipo serializado (sin Decimals)
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

    // Extraer valores únicos para los filtros
    const lineas = useMemo(() => {
        const uniqueLineas = [...new Set(productos.map(p => p.linea).filter(Boolean))];
        return uniqueLineas.sort();
    }, [productos]);

    const materiales = useMemo(() => {
        const uniqueMateriales = [...new Set(productos.map(p => p.material).filter(Boolean))];
        return uniqueMateriales.sort();
    }, [productos]);

    // Filtrar productos
    const productosFiltrados = useMemo(() => {
        return productos.filter(producto => {
            // Filtro por nombre
            const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());

            // Filtro por línea
            const matchesLinea = selectedLinea === "all" || producto.linea === selectedLinea;

            // Filtro por material
            const matchesMaterial = selectedMaterial === "all" || producto.material === selectedMaterial;

            // Filtro por precio
            const precio = Number(producto.precio_base_usd);
            const min = minPrice ? Number(minPrice) : 0;
            const max = maxPrice ? Number(maxPrice) : Infinity;
            const matchesPrice = precio >= min && precio <= max;

            return matchesSearch && matchesLinea && matchesMaterial && matchesPrice;
        });
    }, [productos, searchTerm, selectedLinea, selectedMaterial, minPrice, maxPrice]);

    // Función para limpiar filtros
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
                <div className="mb-12">
                    <h1 className="text-5xl text-center font-black tracking-tighter mb-2">
                        CATÁLOGO DIGITAL
                    </h1>
                    <div className="h-1.5 w-32 bg-[#00D1C1] rounded-full"></div>
                </div>

                <div className="mb-8 bg-gray-50/50 border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="relative">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4E79]/60 mb-2">
                                Buscar Producto
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Nombre del producto..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filtro por Línea */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4E79]/60 mb-2">
                                Línea
                            </label>
                            <select
                                value={selectedLinea}
                                onChange={(e) => setSelectedLinea(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent bg-white"
                            >
                                <option value="all">Todas las líneas</option>
                                {lineas.map((linea) => (
                                    <option key={linea} value={linea || ""}>
                                        {linea}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Material */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4E79]/60 mb-2">
                                Material
                            </label>
                            <select
                                value={selectedMaterial}
                                onChange={(e) => setSelectedMaterial(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent bg-white"
                            >
                                <option value="all">Todos los materiales</option>
                                {materiales.map((material) => (
                                    <option key={material} value={material || ""}>
                                        {material}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Rango de Precio */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4E79]/60 mb-2">
                                Rango de Precio USD
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="Min"
                                    className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="Max"
                                    className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D1C1] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botón para limpiar filtros */}
                    {hasActiveFilters && (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Mostrando <span className="font-bold text-[#1F4E79]">{productosFiltrados.length}</span> de {productos.length} productos
                            </p>
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-[#1F4E79] transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabla de Productos */}
                <div className="w-full border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden">
                    {/* Encabezados - Ajuste de columnas */}
                    <div className="grid grid-cols-12 bg-gray-50/50 py-4 px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F4E79]/60 border-b border-gray-100">
                        <div className="col-span-6">Producto / Descripción</div>
                        <div className="col-span-3 text-right">Precio USD</div>
                        <div className="col-span-3 text-right">Acción</div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {productosFiltrados.map((p) => (
                            <div
                                key={p.id}
                                className="grid grid-cols-12 py-4 px-8 text-black items-center hover:bg-gray-50 transition-all group"
                            >
                                {/* Información del Producto */}
                                <div className="col-span-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-base font-bold group-hover:text-[#1F4E79] transition-colors uppercase tracking-tight">
                                            {p.nombre}
                                        </span>
                                        {p.linea && (
                                            <span className="text-[9px] font-bold text-[#1F4E79]/40 border border-[#1F4E79]/10 px-2 py-0.5 rounded uppercase">
                                                {p.linea}
                                            </span>
                                        )}
                                        {p.material && (
                                            <span className="text-[9px] font-bold text-[#00D1C1]/60 border border-[#00D1C1]/10 px-2 py-0.5 rounded uppercase">
                                                {p.material}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Precio */}
                                <div className="col-span-3 text-right">
                                    <span className="text-xl font-mono font-black text-[#00D1C1]">
                                        ${Number(p.precio_base_usd).toFixed(2)}
                                    </span>
                                </div>

                                {/* BOTÓN DE COMPRA */}
                                <div className="col-span-3 text-right">
                                    <button
                                        onClick={() => {
                                            const productoParaCarrito = {
                                                id: p.id,
                                                nombre: p.nombre,
                                                precio: Number(p.precio_base_usd),
                                                quantity: 1
                                            };

                                            const currentCart = JSON.parse(localStorage.getItem("cart_extrarango") || "[]");
                                            const existingIndex = currentCart.findIndex((item: any) => item.id === p.id);

                                            if (existingIndex > -1) {
                                                currentCart[existingIndex].quantity += 1;
                                            } else {
                                                currentCart.push(productoParaCarrito);
                                            }

                                            localStorage.setItem("cart_extrarango", JSON.stringify(currentCart));
                                            window.dispatchEvent(new Event("cartUpdated"));
                                        }}
                                        className="inline-flex items-center justify-center gap-2 bg-[#1F4E79] text-white px-4 py-2 rounded-xl text-[11px] font-bold hover:bg-[#153a5a] transition-all active:scale-95 shadow-md shadow-[#1F4E79]/10"
                                    >
                                        <ShoppingCart size={14} />
                                        <span className="hidden sm:inline">AÑADIR</span>
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
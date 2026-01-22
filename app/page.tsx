import Hero from "@/components/Hero";
import productService from "@/services/productService";

export const dynamic = "force-dynamic";

function serializeProductos(productos: any[]) {
  return productos.map(p => ({
    ...p,
    precio_base_usd: p.precio_base_usd.toString(),
    indice_refraccion: p.indice_refraccion?.toString() || null,
  }));
}

export default async function Home() {
  try {
    const productosRaw = await productService.getAll();
    const productos = serializeProductos(productosRaw);

    return (
      <main className="bg-white min-h-screen selection:bg-[#00D1C1]/30">
        <Hero productos={productos} />
      </main>
    );
  } catch (error) {
    console.error("Error cargando productos:", error);
    return (
      <main className="bg-white min-h-screen flex items-center justify-center text-red-500">
        Error al conectar con la base de datos.
      </main>
    );
  }
}
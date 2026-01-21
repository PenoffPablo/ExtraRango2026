
import Hero from "@/components/Hero";
import productService from "@/services/productService";

// Función helper para serializar Decimals
function serializeProductos(productos: any[]) {
  return productos.map(p => ({
    ...p,
    precio_base_usd: p.precio_base_usd.toString(),
    indice_refraccion: p.indice_refraccion?.toString() || null,
  }));
}

export default async function Home() {
  const productosRaw = await productService.getAll();
  const productos = serializeProductos(productosRaw);

  return (
    <main className="bg-white min-h-screen selection:bg-[#00D1C1]/30">
      <Hero productos={productos} />
    </main>
  );
}
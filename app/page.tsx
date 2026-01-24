import Hero from "@/components/Hero";
import productService from "@/services/productService";
import db from "@/lib/db";

export const revalidate = 3600;

export default async function Home() {
  try {
    console.log("--- INICIO DEBUGGING HOME ---");

    // 1. Verificamos productos
    const productosRaw = await productService.getAll();
    console.log(`1. Productos encontrados: ${productosRaw.length}`);
    if (productosRaw.length > 0) {
      console.log("   Ejemplo Producto 1 (Precio Raw):", productosRaw[0].precio_base_usd);
    }

    // 2. Verificamos cotización
    const ultimaCotizacion = await db.pedidos.findFirst({
      orderBy: { fecha_pedido: 'desc' },
      select: { cotizacion_dolar_dia: true }
    });

    console.log("2. Objeto Cotización:", ultimaCotizacion);

    // Definimos la tasa
    let tasaDolar = 1480;
    if (ultimaCotizacion && ultimaCotizacion.cotizacion_dolar_dia) {
      tasaDolar = Number(ultimaCotizacion.cotizacion_dolar_dia);
    }
    console.log(`3. Tasa usada para cálculo: ${tasaDolar}`);

    // 3. Serialización y Cálculo
    const productos = productosRaw.map((p: any) => {
      const precioUsd = Number(p.precio_base_usd);
      const precioArs = precioUsd * tasaDolar;
      return {
        ...p,
        precio_base_usd: p.precio_base_usd.toString(),
        precio_ars: precioArs.toLocaleString('es-AR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        indice_refraccion: p.indice_refraccion?.toString() || null,
      };
    });

    console.log("--- FIN DEBUGGING HOME ---");

    return (
      <main className="bg-white min-h-screen selection:bg-[#00D1C1]/30">
        <Hero productos={productos} />
      </main>
    );
  } catch (error) {
    console.error("!!! ERROR CRÍTICO EN HOME !!!", error);
    return (
      <main className="p-20 text-red-500 font-bold text-center">
        Error de Diagnóstico (Revisar Terminal)
      </main>
    );
  }
}
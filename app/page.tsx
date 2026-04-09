import Hero from "@/components/Hero";
import productService from "@/services/productService";
import { getDollarRate } from "@/lib/getDollar";

export const revalidate = 3600;

export default async function Home() {
  try {
    const productosRaw = await productService.getAllRaw();
    let tasaDolar = await getDollarRate();
    if (!tasaDolar) {
      tasaDolar = 1480;
    }

    const productos = productosRaw.map((p: any) => {
      const precioUsd = Number(p.precio_base_usd);
      const precioArs = Math.round(precioUsd * tasaDolar);

      return {
        ...p,
        precio_base_usd: p.precio_base_usd.toString(),
        precio_ars: precioArs.toLocaleString('es-AR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }),
        indice_refraccion: p.indice_refraccion?.toString() || null,
        esfera_desde: p.esfera_desde?.toString() || null,
        esfera_hasta: p.esfera_hasta?.toString() || null,
        cilindro_hasta: p.cilindro_hasta?.toString() || null,
        suma_max_pos: p.suma_max_pos?.toString() || null,
        suma_max_neg: p.suma_max_neg?.toString() || null,
      };
    });

    return (
      <main className="bg-white min-h-screen selection:bg-[#00D1C1]/30">
        <Hero productos={productos} />
      </main>
    );
  } catch (error) {
    console.error("Error crítico:", error);
    return <main>Error de carga</main>;
  }
}
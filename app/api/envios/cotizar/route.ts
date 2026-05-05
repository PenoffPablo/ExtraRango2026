import { NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * POST /api/envios/cotizar
 * Recibe { codigo_postal } y devuelve opciones de envío (Andreani + Correo Argentino)
 * basándose en la tabla zonas_envio.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { codigo_postal } = body;

        if (!codigo_postal || typeof codigo_postal !== "string" || codigo_postal.length < 4) {
            return NextResponse.json(
                { error: "Código postal inválido. Debe tener al menos 4 dígitos." },
                { status: 400 }
            );
        }

        const cp = codigo_postal.trim();

        // Buscar zona que contenga el CP (rango cp_desde - cp_hasta)
        const zona = await db.zonas_envio.findFirst({
            where: {
                cp_desde: { lte: cp },
                cp_hasta: { gte: cp },
                activo: true,
            },
        });

        if (!zona) {
            return NextResponse.json(
                { 
                    error: "No encontramos cobertura de envío para tu código postal. Contactanos para coordinar.",
                    codigo_postal: cp 
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            codigo_postal: cp,
            provincia: zona.provincia,
            opciones: [
                {
                    transportista: "ANDREANI",
                    nombre: "Andreani",
                    costo_ars: Number(zona.costo_andreani),
                    dias_estimados: zona.dias_andreani,
                },
                {
                    transportista: "CORREO_ARGENTINO",
                    nombre: "Correo Argentino",
                    costo_ars: Number(zona.costo_correo),
                    dias_estimados: zona.dias_correo,
                },
            ],
        });
    } catch (error: any) {
        console.error("ERROR_COTIZAR_ENVIO:", error);
        return NextResponse.json(
            { error: "Error interno al cotizar envío" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
    try {
        const tratamientos = await db.tratamientos.findMany({
            where: { estado: true },
            orderBy: [
                { categoria: 'asc' },
                { nombre: 'asc' }
            ]
        });

        const tratamientosSerializados = tratamientos.map(t => ({
            ...t,
            precio_usd: Number(t.precio_usd),
        }));

        return NextResponse.json(tratamientosSerializados);
    } catch (error) {
        console.error("ERROR_TRATAMIENTOS:", error);
        return NextResponse.json({ error: "Error al obtener tratamientos" }, { status: 500 });
    }
}

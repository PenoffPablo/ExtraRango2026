import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const ultimoPedido = await db.pedidos.findFirst({
            orderBy: { fecha_pedido: 'desc' },
            select: { cotizacion_dolar_dia: true }
        });

        const cotizacion = ultimoPedido ? Number(ultimoPedido.cotizacion_dolar_dia) : 1480;

        return NextResponse.json({ valor: cotizacion });
    } catch (error) {
        return NextResponse.json({ valor: 1480 }, { status: 500 });
    }
}
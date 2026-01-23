import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
        }

        const pedidos = await db.pedidos.findMany({
            where: {
                usuario_id: Number(userId)
            },
            include: {
                detalles_pedido: {
                    include: {
                        productos: {
                            select: { nombre: true, imagen_url: true }
                        }
                    }
                }
            },
            orderBy: {
                fecha_pedido: 'desc'
            }
        });

        return NextResponse.json(pedidos);

    } catch (error) {
        console.error("ERROR_HISTORIAL:", error);
        return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 });
    }
}
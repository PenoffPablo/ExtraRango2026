import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verificarToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const tokenPayload = await verificarToken();

        if (!tokenPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const userId = tokenPayload.id;

        const pedidos = await db.pedidos.findMany({
            where: {
                usuario_id: userId
            },
            include: {
                detalles_pedido: {
                    include: {
                        productos: {
                            select: { nombre: true }
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
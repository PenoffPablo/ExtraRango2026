import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = Number(params.id);

        const pedido = await db.pedidos.findUnique({
            where: { id: id },
            include: {
                usuarios: true,
                detalles_pedido: {
                    include: {
                        productos: true
                    }
                }
            }
        });

        if (!pedido) {
            return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
        }

        return NextResponse.json(pedido);

    } catch (error) {
        console.error("ERROR_REMITO:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
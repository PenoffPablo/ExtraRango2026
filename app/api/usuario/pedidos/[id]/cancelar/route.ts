import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const pedidoId = parseInt(params.id);

        //Buscar pedido
        const pedido = await db.pedidos.findUnique({
            where: { id: pedidoId },
        });

        if (!pedido) {
            return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
        }

        //Solo cancelar si está PENDIENTE
        if (pedido.estado !== "PENDIENTE") {
            return NextResponse.json(
                { error: "No se puede cancelar un pedido que ya está en proceso o terminado" },
                { status: 400 }
            );
        }

        //Actualizamos el estado
        const pedidoCancelado = await db.pedidos.update({
            where: { id: pedidoId },
            data: { estado: "CANCELADO" },
        });

        return NextResponse.json(pedidoCancelado);
    } catch (error) {
        return NextResponse.json({ error: "Error al cancelar" }, { status: 500 });
    }
}
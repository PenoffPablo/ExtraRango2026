import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { usuario_id, items, total_usd, cotizacion_dolar } = body;

        // 1. Validaciones
        if (!usuario_id || !items || items.length === 0) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        // 2. Crear Pedido
        const nuevoPedido = await db.pedidos.create({
            data: {
                usuario_id: Number(usuario_id),
                estado: "PENDIENTE",
                cotizacion_dolar_dia: Number(cotizacion_dolar),
                total_usd: Number(total_usd),
                total_ars: Number(total_usd) * Number(cotizacion_dolar),

                detalles_pedido: {
                    create: items.map((item: any) => ({
                        producto_id: item.id,
                        cantidad: item.cantidad,
                        precio_unitario_usd: item.precio,
                        subtotal_usd: Number(item.precio) * Number(item.cantidad),
                        ojo: item.ojo || "AMBOS",
                        esfera: item.esfera ? Number(item.esfera) : null,
                        cilindro: item.cilindro ? Number(item.cilindro) : null,
                        eje: item.eje ? Number(item.eje) : null
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, pedidoId: nuevoPedido.id });

    } catch (error) {
        console.error("ERROR_CREAR_PEDIDO:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
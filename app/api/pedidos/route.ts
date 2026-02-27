import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { usuario_id, items, total_usd, cotizacion_dolar } = body;

        // 1. Validaciones
        if (!usuario_id || !items || items.length === 0) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const cotizacion = Number(cotizacion_dolar);
        const totalUsd = Number(total_usd);

        // 2. Crear Pedido con detalles
        const nuevoPedido = await db.pedidos.create({
            data: {
                usuario_id: Number(usuario_id),
                estado: "PENDIENTE",
                cotizacion_dolar_dia: cotizacion,
                total_usd: totalUsd,
                total_ars: totalUsd * cotizacion,

                detalles_pedido: {
                    create: items.map((item: any) => {
                        const precioUnitarioUsd = Number(item.precio);
                        const cantidad = Number(item.cantidad);
                        const subtotalUsd = precioUnitarioUsd * cantidad;

                        return {
                            producto_id: item.id,
                            cantidad: cantidad,
                            nombre_snapshot: item.nombre || null,
                            precio_unitario_usd: precioUnitarioUsd,
                            precio_unitario_ars: precioUnitarioUsd * cotizacion,
                            subtotal_usd: subtotalUsd,
                            subtotal_ars: subtotalUsd * cotizacion,
                            ojo: item.ojo || "AMBOS",
                            esfera: item.esfera ? Number(item.esfera) : null,
                            cilindro: item.cilindro ? Number(item.cilindro) : null,
                            eje: item.eje ? Number(item.eje) : null,
                        };
                    })
                }
            },
            include: {
                detalles_pedido: true
            }
        });

        // 3. Guardar tratamientos por cada detalle
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const detalle = nuevoPedido.detalles_pedido[i];

            if (item.tratamientos && item.tratamientos.length > 0 && detalle) {
                for (const trat of item.tratamientos) {
                    await db.detalles_pedido_tratamientos.create({
                        data: {
                            detalle_pedido_id: detalle.id,
                            tratamiento_id: trat.id,
                            precio_usd: Number(trat.precio_usd),
                        }
                    });
                }
            }
        }

        return NextResponse.json({ success: true, pedidoId: nuevoPedido.id });

    } catch (error) {
        console.error("ERROR_CREAR_PEDIDO:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
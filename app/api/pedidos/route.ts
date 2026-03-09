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

        // 2. Expandir items: si un item tiene ojo="AMBOS" con recetas separadas (esferaOD/OI),
        //    se desdobla en 2 detalles (uno para OD y otro para OI).
        const expandedItems: any[] = [];
        for (const item of items) {
            if (item.ojo === "AMBOS" && item.esferaOD !== null && item.esferaOD !== undefined) {
                // Desdoblamos en 2 líneas con el precio unitario (sin duplicar el total)
                const precioUnitarioUsd = Number(item.precio);
                expandedItems.push({
                    ...item,
                    ojo: "DERECHO",
                    cantidad: 1,
                    esfera: item.esferaOD,
                    cilindro: item.cilindroOD,
                    eje: item.ejeOD,
                    adicion: item.adicionOD ?? item.adicion ?? null,
                    precio: precioUnitarioUsd,
                });
                expandedItems.push({
                    ...item,
                    ojo: "IZQUIERDO",
                    cantidad: 1,
                    esfera: item.esferaOI,
                    cilindro: item.cilindroOI,
                    eje: item.ejeOI,
                    adicion: item.adicionOI ?? item.adicion ?? null,
                    precio: precioUnitarioUsd,
                });
            } else {
                expandedItems.push(item);
            }
        }

        // 3. Crear Pedido con detalles
        const nuevoPedido = await db.pedidos.create({
            data: {
                usuario_id: Number(usuario_id),
                estado: "PENDIENTE",
                cotizacion_dolar_dia: cotizacion,
                total_usd: totalUsd,
                total_ars: totalUsd * cotizacion,

                detalles_pedido: {
                    create: expandedItems.map((item: any) => {
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
                            esfera: item.esfera !== undefined && item.esfera !== null ? Number(item.esfera) : null,
                            cilindro: item.cilindro !== undefined && item.cilindro !== null ? Number(item.cilindro) : null,
                            eje: item.eje !== undefined && item.eje !== null ? Number(item.eje) : null,
                            adicion: item.adicion !== undefined && item.adicion !== null ? Number(item.adicion) : null,
                        };
                    })
                }
            },
            include: {
                detalles_pedido: true
            }
        });

        // 4. Guardar tratamientos por cada detalle
        //    Necesitamos mappear los expandedItems a los detalles creados
        for (let i = 0; i < expandedItems.length; i++) {
            const item = expandedItems[i];
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

    } catch (error: any) {
        console.error("ERROR_CREAR_PEDIDO:", error);

        if (error.code === 'P2003') {
            return NextResponse.json({ error: "Algunos productos o tratamientos de tu carrito fueron actualizados y ya no existen con ese ID. Por favor, vacía tu carrito y vuelve a agregarlos." }, { status: 400 });
        }

        return NextResponse.json({ error: error?.message || "Error interno del servidor" }, { status: 500 });
    }
}
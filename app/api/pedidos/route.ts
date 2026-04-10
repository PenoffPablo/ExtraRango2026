import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verificarToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const tokenPayload = await verificarToken();
        if (!tokenPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const { items, cotizacion_dolar } = body;

        const usuario_id = tokenPayload.id;

        // 1. Validaciones
        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const cotizacion = Number(cotizacion_dolar);

        // EXTRAER IDS ÚNICOS PARA BÚSQUEDA MASIVA EN BD
        const productoIds = [...new Set(items.map((i: any) => i.id))];
        const tratamientoIds = new Set<number>();
        for (const item of items) {
            if (item.tratamientos && Array.isArray(item.tratamientos)) {
                for (const t of item.tratamientos) {
                    tratamientoIds.add(t.id);
                }
            }
        }

        // BUSCAR VERDADEROS PRECIOS EN BD
        const productosBd = await db.productos.findMany({
            where: { id: { in: productoIds as number[] } },
            select: { id: true, precio_base_usd: true }
        });
        
        const tratamientosBd = await db.tratamientos.findMany({
            where: { id: { in: Array.from(tratamientoIds) } },
            select: { id: true, precio_usd: true }
        });

        // Crear mapas de búsqueda rápida
        const mapProductos = new Map(productosBd.map(p => [p.id, Number(p.precio_base_usd)]));
        const mapTratamientos = new Map(tratamientosBd.map(t => [t.id, Number(t.precio_usd)]));

        // 2. Expandir items: si un item tiene ojo="AMBOS" con recetas separadas (esferaOD/OI),
        //    se desdobla en 2 detalles (uno para OD y otro para OI).
        const expandedItems: any[] = [];
        for (const item of items) {
            if (item.ojo === "AMBOS" && item.esferaOD !== null && item.esferaOD !== undefined) {
                expandedItems.push({
                    ...item,
                    ojo: "DERECHO",
                    cantidad: 1,
                    esfera: item.esferaOD,
                    cilindro: item.cilindroOD,
                    eje: item.ejeOD,
                    adicion: item.adicionOD ?? item.adicion ?? null,
                    prisma: item.prismaOD ?? item.prisma ?? null,
                    eje_prisma: item.ejePrismaOD ?? item.ejePrisma ?? null,
                });
                expandedItems.push({
                    ...item,
                    ojo: "IZQUIERDO",
                    cantidad: 1,
                    esfera: item.esferaOI,
                    cilindro: item.cilindroOI,
                    eje: item.ejeOI,
                    adicion: item.adicionOI ?? item.adicion ?? null,
                    prisma: item.prismaOI ?? item.prisma ?? null,
                    eje_prisma: item.ejePrismaOI ?? item.ejePrisma ?? null,
                });
            } else {
                expandedItems.push(item);
            }
        }

        // 3. RECÁLCULO SERVER-SIDE Y PREPARACIÓN DE DETALLES
        let server_total_usd = 0;
        const detalles_preparados = expandedItems.map((item: any) => {
            const precio_base_par = mapProductos.get(item.id);
            if (precio_base_par === undefined) throw new Error(`Producto ${item.id} no existe o no tiene precio válido en BD`);
            
            // Regla principal: Ojo único = 50% del precio base
            const precio_producto_unitario_usd = precio_base_par / 2;

            // Recalcular tratamientos unitarios
            let precio_tratamientos_unitario_usd = 0;
            if (item.tratamientos && Array.isArray(item.tratamientos)) {
                for (const t of item.tratamientos) {
                    const trat_precio_par = mapTratamientos.get(t.id);
                    if (trat_precio_par !== undefined) {
                        precio_tratamientos_unitario_usd += (trat_precio_par / 2);
                    }
                }
            }

            const precioUnitarioDefinitivo_usd = precio_producto_unitario_usd + precio_tratamientos_unitario_usd;
            const cantidad = Number(item.cantidad);
            const subtotalUsd = precioUnitarioDefinitivo_usd * cantidad;

            server_total_usd += subtotalUsd;

            return {
                producto_id: item.id,
                cantidad: cantidad,
                nombre_snapshot: item.nombre || null,
                precio_unitario_usd: precioUnitarioDefinitivo_usd,
                precio_unitario_ars: precioUnitarioDefinitivo_usd * cotizacion,
                subtotal_usd: subtotalUsd,
                subtotal_ars: subtotalUsd * cotizacion,
                ojo: item.ojo || "AMBOS",
                esfera: item.esfera !== undefined && item.esfera !== null ? Number(item.esfera) : null,
                cilindro: item.cilindro !== undefined && item.cilindro !== null ? Number(item.cilindro) : null,
                eje: item.eje !== undefined && item.eje !== null ? Number(item.eje) : null,
                adicion: item.adicion !== undefined && item.adicion !== null ? Number(item.adicion) : null,
                prisma: item.prisma !== undefined && item.prisma !== null ? Number(item.prisma) : null,
                eje_prisma: item.eje_prisma !== undefined && item.eje_prisma !== null ? Number(item.eje_prisma) : null,
                armazon_transversal: item.armazonTransversal !== undefined && item.armazonTransversal !== null ? Number(item.armazonTransversal) : null,
                armazon_altura: item.armazonAltura !== undefined && item.armazonAltura !== null ? Number(item.armazonAltura) : null,
                armazon_diagonal: item.armazonDiagonal !== undefined && item.armazonDiagonal !== null ? Number(item.armazonDiagonal) : null,
                armazon_puente: item.armazonPuente !== undefined && item.armazonPuente !== null ? Number(item.armazonPuente) : null,
                // Conservamos tratamientos para insertarlos en paso 5
                tratamientosOriginales: item.tratamientos || []
            };
        });

        // 4. Crear Pedido con detalles
        const nuevoPedido = await db.pedidos.create({
            data: {
                usuario_id: Number(usuario_id),
                estado: "PENDIENTE",
                cotizacion_dolar_dia: cotizacion,
                total_usd: server_total_usd,
                total_ars: server_total_usd * cotizacion,

                detalles_pedido: {
                    create: detalles_preparados.map(d => {
                        const { tratamientosOriginales, ...detallePuro } = d;
                        return detallePuro;
                    })
                }
            },
            include: {
                detalles_pedido: true
            }
        });

        // 5. Guardar tratamientos por cada detalle (SERVER-SIDE PRECIO)
        for (let i = 0; i < detalles_preparados.length; i++) {
            const itemOriginal = detalles_preparados[i];
            const detalleDb = nuevoPedido.detalles_pedido[i];

            if (itemOriginal.tratamientosOriginales.length > 0 && detalleDb) {
                for (const trat of itemOriginal.tratamientosOriginales) {
                    const trat_precio_par = mapTratamientos.get(trat.id);
                    if (trat_precio_par !== undefined) {
                        await db.detalles_pedido_tratamientos.create({
                            data: {
                                detalle_pedido_id: detalleDb.id,
                                tratamiento_id: trat.id,
                                precio_usd: trat_precio_par / 2, // Se guarda el costo calculado del 50%
                            }
                        });
                    }
                }
            }
        }

        return NextResponse.json({ success: true, pedidoId: nuevoPedido.id });

    } catch (error: any) {
        console.error("ERROR_CREAR_PEDIDO:", error);

        if (error.code === 'P2003') {
            return NextResponse.json({ error: "Algunos productos o tratamientos de tu carrito ya no existen en la base de datos." }, { status: 400 });
        }

        return NextResponse.json({ error: error?.message || "Error interno del servidor" }, { status: 500 });
    }
}
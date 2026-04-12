import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verificarToken } from "@/lib/auth";
import { getDollarRate } from "@/lib/getDollar";

export async function POST(req: Request) {
    try {
        const tokenPayload = await verificarToken();
        if (!tokenPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const { items, idempotencyKey } = body;

        const usuario_id = tokenPayload.id;

        // 1. Validaciones
        if (!idempotencyKey) {
            return NextResponse.json({ error: "Falta Clave Única de Transacción. Recarga la página." }, { status: 400 });
        }
        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        // Validación estricta anti-fraude (Hack de cantidades negativas)
        for (const item of items) {
            if (!Number.isInteger(Number(item.cantidad)) || Number(item.cantidad) <= 0) {
                return NextResponse.json({ error: "Cantidades inválidas en la orden. Violación Zero-Trust interceptada." }, { status: 400 });
            }
        }

        // 1.B Verdad Absoluta Cambiaria

        let cotizacion = await getDollarRate();
        if (!cotizacion) cotizacion = 1480;

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

                tratamientosOriginales: item.tratamientos || []
            };
        });

        // 4. Crear Pedido con detalles (Con Protección de Idempotencia)
        let nuevoPedido;
        try {
            nuevoPedido = await db.pedidos.create({
                data: {
                    usuario_id: Number(usuario_id),
                    idempotency_key: idempotencyKey,
                    estado: "PENDIENTE",
                    cotizacion_dolar_dia: cotizacion,
                    total_usd: server_total_usd,
                    total_ars: server_total_usd * cotizacion,

                    detalles_pedido: {
                        create: detalles_preparados.map(d => {
                            const { tratamientosOriginales, ...detallePuro } = d;

                            // Preparar tratamientos para inserción anidada profunda si existen
                            const tratamientosCreate = tratamientosOriginales
                                .filter((trat: any) => mapTratamientos.has(trat.id))
                                .map((trat: any) => ({
                                    tratamiento_id: trat.id,
                                    precio_usd: (mapTratamientos.get(trat.id) || 0) / 2
                                }));

                            return {
                                ...detallePuro,
                                detalles_pedido_tratamientos: tratamientosCreate.length > 0
                                    ? { create: tratamientosCreate }
                                    : undefined
                            };
                        })
                    }
                },
                include: {
                    detalles_pedido: true
                }
            });
        } catch (dbError: any) {
            // P2002 = Violación de restricción única (Unique constraint failed)
            if (dbError.code === 'P2002') {
                const pedidoPrevio = await db.pedidos.findUnique({
                    where: { idempotency_key: idempotencyKey }
                });
                if (pedidoPrevio) {
                    console.warn(`[IDEMPOTENCIA] Bloqueada orden duplicada. Devolviendo ID original: ${pedidoPrevio.id}`);
                    return NextResponse.json({ success: true, pedidoId: pedidoPrevio.id });
                }
            }
            throw dbError; // Si es otro error de base de datos, que crashee normal
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
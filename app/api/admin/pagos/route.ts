import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verificarAdmin } from "@/lib/auth";
import { z } from "zod";
import { DESCUENTO_ANTICIPADO_PORCENTAJE, DESCUENTO_HORAS_LIMITE } from "@/lib/cuentas-bancarias";

const pagoSchema = z.object({
    pedido_id: z.number().int().positive(),
    monto_ars: z.number().positive("El monto debe ser positivo"),
    metodo_pago: z.string().min(1).max(50).optional(),
    referencia: z.string().max(100).optional(),
    notas: z.string().max(500).optional(),
});

/**
 * POST /api/admin/pagos — Registrar un pago parcial (solo admin)
 */
export async function POST(req: Request) {
    const esAdmin = await verificarAdmin(req);
    if (!esAdmin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = pagoSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Datos inválidos", detalles: parsed.error.format() },
                { status: 400 }
            );
        }

        const { pedido_id, monto_ars, metodo_pago, referencia, notas } = parsed.data;

        // Verificar que el pedido existe
        const pedido = await db.pedidos.findUnique({
            where: { id: pedido_id },
            select: { id: true, total_ars: true, monto_iva_ars: true, fecha_pedido: true, descuento_anticipado: true },
        });

        if (!pedido) {
            return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
        }

        // Obtener ID del admin desde el token (verificarAdmin ya validó)
        const adminId = (esAdmin as any).id || 1;

        // Crear el pago
        const pago = await db.pagos.create({
            data: {
                pedido_id,
                monto_ars,
                metodo_pago: metodo_pago || null,
                referencia: referencia || null,
                notas: notas || null,
                registrado_por: Number(adminId),
            },
        });

        // Actualizar total_pagado_ars del pedido
        const todosLosPagos = await db.pagos.findMany({
            where: { pedido_id },
        });
        const totalPagado = todosLosPagos.reduce((acc, p) => acc + Number(p.monto_ars), 0);

        await db.pedidos.update({
            where: { id: pedido_id },
            data: { total_pagado_ars: totalPagado },
        });

        // === LÓGICA DE DESCUENTO AUTOMÁTICO 10% ===
        const totalConIva = Number(pedido.total_ars) + Number(pedido.monto_iva_ars || 0);
        let descuentoAplicado = Number(pedido.descuento_anticipado || 0);

        // Solo calcular si aún no se aplicó descuento y el pago cubre el total
        if (descuentoAplicado === 0 && totalPagado >= totalConIva) {
            // Verificar que el pago se completó dentro de las 24 horas
            const fechaPedido = new Date(pedido.fecha_pedido!);
            const ahora = new Date();
            const horasTranscurridas = (ahora.getTime() - fechaPedido.getTime()) / (1000 * 60 * 60);

            if (horasTranscurridas <= DESCUENTO_HORAS_LIMITE) {
                descuentoAplicado = totalConIva * DESCUENTO_ANTICIPADO_PORCENTAJE;
                await db.pedidos.update({
                    where: { id: pedido_id },
                    data: { descuento_anticipado: descuentoAplicado },
                });
                console.log(`[DESCUENTO_10%] Pedido #${pedido_id}: descuento $${descuentoAplicado.toFixed(2)} aplicado (${horasTranscurridas.toFixed(1)}hs transcurridas)`);
            } else {
                console.log(`[DESCUENTO_10%] Pedido #${pedido_id}: NO aplica — ${horasTranscurridas.toFixed(1)}hs transcurridas (límite: ${DESCUENTO_HORAS_LIMITE}hs)`);
            }
        }

        return NextResponse.json({
            success: true,
            pago,
            total_pagado_ars: totalPagado,
            descuento_anticipado: descuentoAplicado,
            saldo_pendiente: totalConIva - totalPagado - descuentoAplicado,
        });
    } catch (error: any) {
        console.error("ERROR_REGISTRAR_PAGO:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

/**
 * GET /api/admin/pagos?pedido_id=X — Listar pagos de un pedido (solo admin)
 */
export async function GET(req: Request) {
    const esAdmin = await verificarAdmin(req);
    if (!esAdmin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const pedidoId = searchParams.get("pedido_id");

        if (!pedidoId) {
            return NextResponse.json({ error: "Falta pedido_id" }, { status: 400 });
        }

        const pagos = await db.pagos.findMany({
            where: { pedido_id: Number(pedidoId) },
            include: {
                usuarios: {
                    select: { nombre: true, apellido: true },
                },
            },
            orderBy: { fecha_pago: "desc" },
        });

        // Calcular resumen
        const pedido = await db.pedidos.findUnique({
            where: { id: Number(pedidoId) },
            select: { total_ars: true, total_pagado_ars: true, descuento_anticipado: true, monto_iva_ars: true },
        });

        return NextResponse.json({
            pagos,
            resumen: {
                total_ars: pedido ? Number(pedido.total_ars) : 0,
                monto_iva_ars: pedido ? Number(pedido.monto_iva_ars) : 0,
                total_con_iva: pedido ? Number(pedido.total_ars) + Number(pedido.monto_iva_ars || 0) : 0,
                total_pagado_ars: pedido ? Number(pedido.total_pagado_ars) : 0,
                descuento_anticipado: pedido ? Number(pedido.descuento_anticipado) : 0,
                saldo_pendiente: pedido
                    ? Number(pedido.total_ars) + Number(pedido.monto_iva_ars || 0) - Number(pedido.total_pagado_ars) - Number(pedido.descuento_anticipado)
                    : 0,
            },
        });
    } catch (error: any) {
        console.error("ERROR_LISTAR_PAGOS:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

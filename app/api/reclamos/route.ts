import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verificarToken } from "@/lib/auth";
import { z } from "zod";

const reclamoSchema = z.object({
    pedido_id: z.number().int().positive(),
    tipo: z.enum(["PRODUCTO_DEFECTUOSO", "RECETA_INCORRECTA", "DEMORA_ENVIO", "FACTURACION", "OTRO"]),
    descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(2000),
});

/**
 * POST /api/reclamos — Crear un nuevo reclamo (usuario autenticado)
 */
export async function POST(req: Request) {
    try {
        const tokenPayload = await verificarToken();
        if (!tokenPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = reclamoSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Datos inválidos", detalles: parsed.error.format() },
                { status: 400 }
            );
        }

        const { pedido_id, tipo, descripcion } = parsed.data;
        const usuario_id = tokenPayload.id;

        // Verificar que el pedido pertenece al usuario
        const pedido = await db.pedidos.findFirst({
            where: { id: pedido_id, usuario_id: Number(usuario_id) },
        });

        if (!pedido) {
            return NextResponse.json(
                { error: "Pedido no encontrado o no te pertenece." },
                { status: 404 }
            );
        }

        const reclamo = await db.reclamos.create({
            data: {
                usuario_id: Number(usuario_id),
                pedido_id,
                tipo,
                descripcion,
                estado: "ABIERTO",
            },
        });

        return NextResponse.json({ success: true, reclamo });
    } catch (error: any) {
        console.error("ERROR_CREAR_RECLAMO:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

/**
 * GET /api/reclamos — Listar reclamos del usuario autenticado
 */
export async function GET() {
    try {
        const tokenPayload = await verificarToken();
        if (!tokenPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const reclamos = await db.reclamos.findMany({
            where: { usuario_id: Number(tokenPayload.id) },
            include: {
                pedidos: {
                    select: { id: true, fecha_pedido: true, estado: true, total_ars: true },
                },
            },
            orderBy: { fecha_creacion: "desc" },
        });

        return NextResponse.json(reclamos);
    } catch (error: any) {
        console.error("ERROR_LISTAR_RECLAMOS:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

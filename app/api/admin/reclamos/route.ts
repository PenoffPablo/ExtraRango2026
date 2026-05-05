import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verificarAdmin } from "@/lib/auth";

/**
 * GET /api/admin/reclamos — Listar todos los reclamos (solo admin)
 */
export async function GET(req: Request) {
    const esAdmin = await verificarAdmin(req);
    if (!esAdmin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const reclamos = await db.reclamos.findMany({
            include: {
                usuarios: {
                    select: { nombre: true, apellido: true, email: true, telefono: true },
                },
                pedidos: {
                    select: { id: true, fecha_pedido: true, estado: true, total_ars: true },
                },
            },
            orderBy: { fecha_creacion: "desc" },
        });

        return NextResponse.json(reclamos);
    } catch (error: any) {
        console.error("ERROR_ADMIN_RECLAMOS:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

/**
 * PUT /api/admin/reclamos — Actualizar estado y respuesta de un reclamo (solo admin)
 */
export async function PUT(req: Request) {
    const esAdmin = await verificarAdmin(req);
    if (!esAdmin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, estado, respuesta_admin } = body;

        if (!id || !estado) {
            return NextResponse.json({ error: "Faltan datos (id, estado)" }, { status: 400 });
        }

        const estadosValidos = ["ABIERTO", "EN_REVISION", "RESUELTO", "CERRADO"];
        if (!estadosValidos.includes(estado)) {
            return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
        }

        const dataUpdate: any = { estado };
        if (respuesta_admin) dataUpdate.respuesta_admin = respuesta_admin;
        if (estado === "RESUELTO" || estado === "CERRADO") {
            dataUpdate.fecha_resolucion = new Date();
        }

        const reclamoActualizado = await db.reclamos.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });

        return NextResponse.json({ success: true, reclamo: reclamoActualizado });
    } catch (error: any) {
        console.error("ERROR_UPDATE_RECLAMO:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

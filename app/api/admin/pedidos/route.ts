import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verificarAdmin } from "@/lib/auth"; // <--- IMPORTAR

export async function GET(req: Request) {
    // 1. VERIFICACIÓN DE SEGURIDAD
    const esAdmin = await verificarAdmin(req);
    if (!esAdmin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const pedidos = await db.pedidos.findMany({
            // ... (resto de tu código igual que antes) ...
            include: {
                usuarios: {
                    select: {
                        nombre: true,
                        apellido: true,
                        email: true,
                        telefono: true
                    }
                },
                detalles_pedido: {
                    include: {
                        productos: {
                            select: { nombre: true, codigo_sku: true }
                        }
                    }
                }
            },
            orderBy: { fecha_pedido: "desc" }
        });
        return NextResponse.json(pedidos);
    } catch (error) {
        console.error("ERROR_PEDIDOS:", error);
        return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    // 1. VERIFICACIÓN DE SEGURIDAD
    const esAdmin = await verificarAdmin(req);
    if (!esAdmin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        // ... (resto de tu código igual) ...
        const body = await req.json();
        const { id, estado } = body;

        if (!id || !estado) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        const pedidoActualizado = await db.pedidos.update({
            where: { id: Number(id) },
            data: { estado: estado }
        });

        return NextResponse.json({ success: true, pedido: pedidoActualizado });

    } catch (error) {
        console.error("ERROR_UPDATE:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
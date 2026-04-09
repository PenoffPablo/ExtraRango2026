import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verificarAdmin } from "@/lib/auth";

export async function POST(req: Request) {
    // 1. VERIFICACIÓN DE SEGURIDAD
    const esAdmin = await verificarAdmin(req);
    if (!esAdmin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            nombre, codigo_sku, descripcion,
            material, linea, precio_base_usd,
            stock_actual, suma_max_pos, suma_max_neg
        } = body;

        if (!nombre || !precio_base_usd) {
            return NextResponse.json({ error: "Nombre y Precio obligatorios" }, { status: 400 });
        }

        const nuevoProducto = await db.productos.create({
            data: {
                nombre,
                codigo_sku,
                descripcion,
                material,
                linea,
                precio_base_usd: Number(precio_base_usd),
                stock_actual: Number(stock_actual) || 0,
                suma_max_pos: suma_max_pos ? Number(suma_max_pos) : null,
                suma_max_neg: suma_max_neg ? Number(suma_max_neg) : null,
            }
        });

        return NextResponse.json({ success: true, producto: nuevoProducto });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
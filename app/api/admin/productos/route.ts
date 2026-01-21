import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verificarAdmin } from "@/lib/auth"; // <--- IMPORTAR

export async function POST(req: Request) {
    // 1. VERIFICACIÓN DE SEGURIDAD
    const esAdmin = await verificarAdmin(req);
    if (!esAdmin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        // ... (resto de tu código igual) ...
        const body = await req.json();
        const {
            nombre, codigo_sku, descripcion,
            material, linea, precio_base_usd,
            imagen_url, stock_actual
        } = body;

        // ... validaciones y creación ...
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
                imagen_url,
                estado: true
            }
        });

        return NextResponse.json({ success: true, producto: nuevoProducto });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
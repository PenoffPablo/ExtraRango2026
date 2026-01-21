import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

// ACTUALIZAR DATOS
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, password, ...datos } = body;
        if (!id) {
            return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
        }
        let dataToUpdate: any = { ...datos };

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            dataToUpdate.password_hash = hashedPassword;
        }

        const usuarioActualizado = await db.usuarios.update({
            where: { id: Number(id) },
            data: dataToUpdate,
        });

        const { password_hash, ...usuarioLimpio } = usuarioActualizado;

        return NextResponse.json(usuarioLimpio);

    } catch (error) {
        console.error("ERROR_PERFIL_UPDATE:", error);
        return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

        await db.usuarios.update({
            where: { id: Number(id) },
            data: { activo: false }
        });

        return NextResponse.json({ message: "Cuenta desactivada correctamente" });

    } catch (error) {
        console.error("ERROR_BAJA_USUARIO:", error);
        return NextResponse.json({ error: "No se pudo dar de baja" }, { status: 500 });
    }
}
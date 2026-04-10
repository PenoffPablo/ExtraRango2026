import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { verificarToken } from "@/lib/auth";

// ACTUALIZAR DATOS
export async function PUT(req: Request) {
    try {
        const tokenPayload = await verificarToken();
        if (!tokenPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();
        // Ignoramos el id que venga en el body para evitar spoofing
        const { id, password, ...datos } = body;
        
        const userId = tokenPayload.id;
        
        let dataToUpdate: any = { ...datos };

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            dataToUpdate.password_hash = hashedPassword;
        }

        const usuarioActualizado = await db.usuarios.update({
            where: { id: userId },
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
        const tokenPayload = await verificarToken();
        if (!tokenPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const userId = tokenPayload.id;

        await db.usuarios.update({
            where: { id: userId },
            data: { activo: false }
        });

        return NextResponse.json({ message: "Cuenta desactivada correctamente" });

    } catch (error) {
        console.error("ERROR_BAJA_USUARIO:", error);
        return NextResponse.json({ error: "No se pudo dar de baja" }, { status: 500 });
    }
}
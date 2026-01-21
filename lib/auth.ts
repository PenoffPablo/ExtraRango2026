import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function verificarAdmin(req: Request) {

    const userId = req.headers.get("user-id");

    if (!userId) {
        return false;
    }

    const usuario = await db.usuarios.findUnique({
        where: { id: Number(userId) }
    });

    if (usuario && usuario.rol === "ADMIN") {
        return true;
    }

    return false;
}
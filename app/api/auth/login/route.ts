import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { crearToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        //Buscar si el email existe
        const user = await db.usuarios.findUnique({
            where: { email: String(email) }
        });

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        //Comparar contraseñas
        const passwordMatch = await bcrypt.compare(String(password), user.password_hash);

        if (!passwordMatch) {
            return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
        }

        // Generar JWT
        const token = await crearToken({ id: user.id, rol: user.rol || "CLIENTE" });
        
        // Guardar token en cookie HttpOnly
        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        const { password_hash: _, ...userWithoutPass } = user;

        return NextResponse.json(userWithoutPass);

    } catch (error) {
        console.error("Error en login:", error);
        return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
    }
}
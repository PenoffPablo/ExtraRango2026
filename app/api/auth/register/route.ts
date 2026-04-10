import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { crearToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nombre, apellido, email, password, telefono, cuil, calle, numeracion, departamento, provincia } = body;

        if (!nombre || !apellido || !email || !password) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        const usuarioExistente = await db.usuarios.findUnique({
            where: { email }
        });

        if (usuarioExistente) {
            return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const rolAsignado = "CLIENTE";

        const nuevoUsuario = await db.usuarios.create({
            data: {
                nombre,
                apellido,
                email,
                password_hash: hashedPassword,
                telefono,
                cuil,
                calle,
                numeracion,
                departamento,
                provincia,
                rol: rolAsignado as any
            }
        });

        // Generar JWT
        const token = await crearToken({ id: nuevoUsuario.id, rol: nuevoUsuario.rol || "CLIENTE" });
        
        // Guardar token en cookie HttpOnly
        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        const { password_hash, ...usuarioSinPassword } = nuevoUsuario;

        return NextResponse.json(usuarioSinPassword, { status: 201 });

    } catch (error) {
        console.error("ERROR_REGISTRO:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
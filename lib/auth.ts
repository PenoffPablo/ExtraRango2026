import db from "@/lib/db";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET_VAR = process.env.JWT_SECRET || "secreto_super_seguro_para_desarrollo_extrarango";
const SECRET = new TextEncoder().encode(JWT_SECRET_VAR);

export async function crearToken(payload: { id: number; rol: string }) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(SECRET);
    return token;
}

export async function verificarToken(req?: Request) {
    // Intentar leer de cookies de forma nativa en Next.js App Router
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as { id: number; rol: string };
    } catch (error) {
        return null;
    }
}

export async function verificarAdmin(req?: Request) {
    const payload = await verificarToken(req);
    if (!payload) return false;
    
    // Verificamos en DB por si cambió el rol o fue eliminado recientemente
    const usuario = await db.usuarios.findUnique({
        where: { id: payload.id }
    });

    if (usuario && usuario.rol === "ADMIN" && usuario.activo !== false) {
        return true;
    }

    return false;
}
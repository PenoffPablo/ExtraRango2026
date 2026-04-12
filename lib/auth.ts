import db from "@/lib/db";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

// 1. Validación estricta de seguridad (Existencia y Entropía)
const JWT_SECRET_VAR = process.env.JWT_SECRET;
if (!JWT_SECRET_VAR || JWT_SECRET_VAR.length < 32) {
    throw new Error("FALTA CONFIGURACIÓN CRÍTICA: La variable de entorno JWT_SECRET no está definida o es insegura (mínimo 32 caracteres).");
}

const SECRET = new TextEncoder().encode(JWT_SECRET_VAR);

export async function crearToken(payload: { id: number; rol: string }) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        // 2. Expiración de 7 días adaptada a UX B2B (Sin sistema de Refresh Tokens)
        .setExpirationTime("7d")
        .sign(SECRET);
    return token;
}

export async function verificarToken(req?: Request) {
    // Lectura nativa de cookies en Next.js (App Router)
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
    
    // Si el JWT es inválido, manipulado, o expirado, cortamos acá sin tocar DB.
    if (!payload || payload.rol !== "ADMIN") return false;

    // 3. Bloqueo de Estado Zombie (Revocación Inmediata)
    // Confirmamos a nivel de microsegundos que el administrador no fue baneado ni degradado.
    const usuario = await db.usuarios.findUnique({
        where: { id: payload.id },
        select: { rol: true, activo: true }
    });

    if (usuario && usuario.rol === "ADMIN" && usuario.activo !== false) {
        return true;
    }

    return false;
}
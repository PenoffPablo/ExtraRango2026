import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.set("auth_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0 // Inmediata expiración
        });
        
        return NextResponse.json({ success: true, message: "Sesión cerrada correctamente" });
    } catch (e) {
        return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 });
    }
}

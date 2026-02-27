import { NextResponse } from "next/server";
import { getDollarRate } from "@/lib/getDollar";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let cotizacion = await getDollarRate();
        if (!cotizacion) {
            cotizacion = 1480; // fallback
        }

        return NextResponse.json({ valor: cotizacion });
    } catch (error) {
        return NextResponse.json({ valor: 1480 }, { status: 500 });
    }
}
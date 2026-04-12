import db from "@/lib/db";

export async function getDollarRate() {
    try {
        const response = await fetch("https://api.bluelytics.com.ar/v2/latest", {
            next: { revalidate: 3600 }
        });
        
        if (!response.ok) throw new Error("HTTP " + response.status);

        const data = await response.json();
        const rate = data.oficial.value_sell;
        
        // Persistencia Rápida en MySQL (Actualizar caché maestro)
        await db.configuracion_sistema.upsert({
            where: { id: 1 },
            update: { dolar_oficial: rate, ultima_actualizacion: new Date() },
            create: { id: 1, dolar_oficial: rate, ultima_actualizacion: new Date() }
        });

        return rate;
    } catch (error) {
        console.error("API Dolar Caída. Iniciando protocolo de contingencia en BDD...");
        
        try {
            const configObj = await db.configuracion_sistema.findUnique({ where: { id: 1 } });
            
            if (!configObj) {
                console.error("[CRITICO] API muerta y sin caché en BDD. Sistema bloqueado.");
                return null;
            }

            const horasPasadas = (Date.now() - configObj.ultima_actualizacion.getTime()) / (1000 * 60 * 60);

            // EVALUACIÓN KILL SWITCH
            if (horasPasadas > 12) {
                console.error(`[KILL SWITCH ACTIVADO] Dólar estancado hace ${horasPasadas.toFixed(1)} horas (!). Deteniendo ventas por riesgo inflacionario.`);
                return null; // Esto activará el Status 503 en route.ts
            }

            console.warn(`[RESERVA ACTIVA] Usando dólar de archivo de hace ${horasPasadas.toFixed(1)} hrs.`);
            return Number(configObj.dolar_oficial);
            
        } catch (dbError) {
            console.error("Fallo catastrófico en DB intentando leer dolar de contingencia", dbError);
            return null;
        }
    }
}
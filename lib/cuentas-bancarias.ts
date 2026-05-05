/**
 * Datos de cuentas bancarias para transferencias.
 * 
 * FACTURA_A → Procynter SRL (se aplica 21% IVA)
 * REMITO    → Ricardo Impagliazzo (sin IVA)
 * 
 * CBUs FICTICIOS para desarrollo. Reemplazar con los reales en producción.
 */
export const CUENTAS_BANCARIAS = {
    FACTURA_A: {
        titular: "Procynter SRL",
        cuit: "30-71234567-9",
        banco: "Banco Nación Argentina",
        cbu: "0110599940059941000215",
        alias: "PROCYNTER.OPTICA.SRL",
        tipo_cuenta: "Cuenta Corriente en Pesos",
    },
    REMITO: {
        titular: "Ricardo Impagliazzo",
        cuit: "20-28345678-3",
        banco: "Banco Galicia",
        cbu: "0070055830004036263016",
        alias: "RICARDO.OPTICA.GAL",
        tipo_cuenta: "Caja de Ahorro en Pesos",
    },
} as const;

export type TipoComprobante = "FACTURA_A" | "REMITO";

/** Porcentaje de IVA que se aplica cuando el cliente solicita Factura A */
export const IVA_PORCENTAJE = 0.21;

/** Horas límite para aplicar el descuento del 10% por pago anticipado */
export const DESCUENTO_HORAS_LIMITE = 24;

/** Porcentaje de descuento por pago anticipado */
export const DESCUENTO_ANTICIPADO_PORCENTAJE = 0.10;

# Auditoría Técnica de Rangos - ExtraRango

Este documento detalla los rangos de esfera y límites de suma (Potencia Meridional) configurados para los 102 productos del catálogo.

| Producto | Esfera Desde | Esfera Hasta | Cilindro Hasta | Suma Máx (+) | Suma Máx (-) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Orgánico Blanco 1.50 CR-39 | -4.00 | +4.00 | 2.00 | +4.25 | -4.25 |
| Orgánico Blanco Rango Extendido | -6.00 | +6.00 | 4.00 | +6.25 | -6.25 |
| Orgánico Stock con Antirreflex | -4.00 | +4.00 | 2.00 | +4.00 | -4.00 |
| Maxifoto con Antirreflex | -4.00 | +4.00 | 2.00 | +4.00 | -4.00 |
| Maxifoto AR Rango Extendido | -6.00 | +6.00 | 4.00 | +6.00 | -6.00 |
| Policarbonato Blanco | -4.00 | +4.00 | 2.00 | +4.00 | -4.00 |
| Policarbonato con Antirreflex | -4.00 | +4.00 | 2.00 | +4.00 | -4.00 |
| Policarbonato Maxifoto | -4.00 | +4.00 | 2.00 | +4.00 | -4.00 |
| Lámina Polarizado Neutro | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Laboratorio Digital Orgánico 1.50 | -10.00 | +10.00 | 4.00 | +10.00 | -10.00 |
| Laboratorio Digital 1.56 Blue Cut | -14.00 | +6.00 | 4.00 | +6.00 | -14.00 |
| Laboratorio Digital Policarbonato | -15.00 | +8.00 | 4.00 | +8.00 | -15.00 |
| Laboratorio Digital High Index 1.67 | -17.00 | +8.00 | 4.00 | +8.00 | -17.00 |
| Laboratorio Digital Extra High Index 1.74 | -14.00 | +6.00 | 4.00 | +6.00 | -14.00 |
| Bifocal Kriptock Digital 1.50 Blanco | -5.00 | +4.50 | 4.00 | +4.00 | -5.00 |
| Bifocal Kriptock Digital 1.50 Maxifoto | -12.00 | +10.00 | 6.00 | +10.00 | -12.00 |
| Multifocal ViXion START 1.50 | -8.00 | +6.00 | 4.00 | +6.00 | -8.00 |
| Multifocal ViXion START 1.56 Blue | -8.00 | +6.00 | 4.00 | +6.00 | -8.00 |
| Multifocal ViXion DigiLIFE 1.50 | -12.00 | +8.00 | 6.00 | +8.00 | -12.00 |
| Multifocal ViXion ID 1.50 | -7.00 | +6.00 | 6.00 | +6.00 | -7.00 |

*(Nota: Esta es una muestra. El sistema aplica las validaciones dinámicamente para los 102 productos basados en sus IDs únicos).*

## Reglas de Validación Aplicadas:
1. **Esfera Individual**: Si `esfera < esfera_desde` o `esfera > esfera_hasta` -> BLOQUEAR.
2. **Cilindro Individual**: Si `abs(cilindro) > abs(cilindro_hasta)` -> BLOQUEAR.
3. **Potencia Meridional**: Si `(esfera + cilindro) < suma_max_neg` o `(esfera + cilindro) > suma_max_pos` -> BLOQUEAR.

---
Generado el 10/04/2026 para revisión de Pablo.

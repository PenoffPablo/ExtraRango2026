# Reglas de Negocio: ExtraRango

Este documento detalla la lógica comercial y las validaciones técnicas aplicadas en el sistema de cotización.

## 1. Lógica de Precios

### El Precio del Catálogo es por PAR
Todos los precios base de los cristales en la base de datos se consideran como el valor por el **PAR** de cristales.

### Cotización por Ojo Único
Si un usuario solicita el cristal para un solo ojo (Ojo Derecho o Ojo Izquierdo), el sistema:
1. Divide el precio base del cristal por 2.
2. Divide el precio de cada tratamiento adicional por 2.
3. El total mostrado en el checkout será exactamente el **50%** de lo que costaría el par.

### Conversión de Moneda
El sistema utiliza una cotización del dólar dinámica.
`Precio ARS = (Precio Base USD + Σ Tratamientos USD) * Cotización Dólar`

## 2. Validaciones de la Receta

### Potencia Meridional (ESF + CIL)
El sistema no solo valida la Esfera y el Cilindro por separado, sino que también verifica la **potencia total**.
- **Regla**: `Esfera + Cilindro` debe estar dentro del rango permitido por la Esfera del cristal.
- **Ejemplo**: Si un cristal soporta de -4.00 a +4.00, y el usuario carga ESF -4.00 y CIL -1.00, la potencia total es -5.00. El sistema bloqueará esta combinación por exceder el rango físico del material.

### Adición (ADD)
Para productos de las líneas **Bifocal, Multifocal y Ocupacional**, el campo `Adición` es obligatorio y debe estar entre `+0.75` y `+3.50`.

## 3. Matriz de Compatibilidad de Tratamientos

El sistema filtra automáticamente los tratamientos según el material y las características del cristal seleccionado:

- **Antiparras**: Solo se permite si el material es `Laboratorio Poly`. No es compatible con cristales de stock.
- **Antirreflejo (AR)**: Se oculta automáticamente si el nombre del cristal ya indica que incluye AR (evita doble cargo).
- **Protección Blue Cut**: Se oculta si el cristal ya es de la línea "Blue".
- **Color/Polarizados**: Se ocultan en lentes solares o ya coloreados.
- **Mutual Exclusión**: No se pueden seleccionar dos tratamientos de la misma categoría tecnológica. Por ejemplo, seleccionar `Clariflex Plus` desactiva automáticamente `Clariflex`.
- **Sport Design**: Los recargos técnicos de este tipo se muestran como "A CONSULTAR" y no añaden un precio numérico automático para forzar la validación técnica manual.

## 4. Máscaras de Buceo
Las Máscaras de Buceo son productos de catálogo general y no aparecen como tratamientos seleccionables dentro del modal de receta de otros cristales.

# Arsenal de Testing: Guía de Mantenimiento

ExtraRango utiliza una suite de pruebas automatizadas para garantizar que los cambios en el código no rompan la lógica de cotización o las validaciones ópticas.

## Stack de Testing
- **Vitest**: Motor de ejecución de pruebas veloz y compatible con Vite.
- **React Testing Library**: Para simular interacciones de usuario en el DOM.
- **JSDOM**: Entorno de navegador simulado.

## Cómo ejecutar los tests

### 1. Ejecución completa
Para correr todos los tests y ver un resumen rápido:
`npm test`

### 2. Modo Watch (Desarrollo)
Para que los tests se ejecuten automáticamente al guardar un archivo:
`npx vitest`

### 3. Reporte de Cobertura
`npx vitest run --coverage`

## Estructura de los Tests
Los tests se encuentran en `components/__tests__`. El archivo principal es `RecetaModal.test.tsx`.

### Qué se evalúa actualmente:
- **Cálculo de Precios por Ojo**: Verifica que un solo ojo cueste el 50% del par.
- **Exclusión Mutua**: Confirma que tratamientos de la misma categoría no se puedan duplicar.
- **Compatibilidad de Materiales**: Asegura que recargos como "Antiparras" solo se muestren para Poly.
- **Validación de Potencia Meridional**: Prueba combinaciones de ESF+CIL que deberían fallar.
- **Captura de Prisma y Medidas**: Verifica que el objeto final que se envía al carrito contenga los nuevos campos extendidos.

## Guía para añadir nuevos tests

Si añades una nueva regla de negocio (ej. un nuevo descuento por cantidad), sigue estos pasos:
1. Abre `RecetaModal.test.tsx`.
2. Añade un nuevo bloque `it('debe calcular...', async () => { ... })`.
3. Utiliza la función auxiliar `matchNumber` para validar precios de forma independiente al formato de moneda local.
4. Ejecuta `npm test` para confirmar la integridad.

## Pruebas de Sistema (Browser Agent)
Además de los tests unitarios, periódicamente se realizan sesiones de "Arsenal Testing" mediante un agente de navegación que verifica el flujo completo:
1. Selección de Producto -> 2. Configuración en Modal -> 3. Persistencia en Carrito -> 4. Creación de Pedido en Base de Datos.

# Arquitectura del Sistema: ExtraRango

Este documento describe la estructura técnica y el flujo de datos del sistema de ecommerce óptico ExtraRango.

## Stack Tecnológico

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Client Components).
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) con [Prisma ORM](https://www.prisma.io/).
- **Estilos**: Tailwind CSS 4.
- **Testing**: [Vitest](https://vitest.dev/) y [React Testing Library](https://testing-library.com/).
- **Iconos**: Lucide React.
- **Cotización**: API dinámica de valor de dólar (ars/usd).

## Flujo de Datos del Pedido

El proceso de creación de un pedido sigue estos pasos:

1.  **Selección y Configuración (`RecetaModal`)**:
    - El usuario selecciona un cristal del catálogo.
    - Se cargan los datos de la receta (Ojo Derecho, Izquierdo o Ambos).
    - Se aplican validaciones de rango (ESF/CIL/ADD) y compatibilidad de tratamientos en tiempo real.
    - El cliente puede añadir una sección de "Medidas de Armazón".

2.  **Carrito de Compras (`LocalStorage`)**:
    - Los datos configurados se guardan en `localStorage` bajo la clave `cart_extrarango`.
    - Si el pedido es para un solo ojo, se marca como `ojo: "DERECHO"` o `"IZQUIERDO"`.
    - Si es para el par, se guarda como `ojo: "AMBOS"`, manteniendo los datos de `esferaOD/OI`, `cilindroOD/OI`, etc.

3.  **Procesamiento en el Backend (`API Orders`)**:
    - Al finalizar la compra, el frontend envía el carrito al endpoint `/api/pedidos`.
    - **Desdoblamiento (Splitting)**: Si un ítem es de tipo `AMBOS`, la API lo desdobla en dos registros en la base de datos (uno para OD y otro para OI) con el precio unitario (par / 2) para facilitar la gestión en el laboratorio.

4.  **Persistencia**:
    - Se guardan los registros en la tabla `pedidos` y sus correspondientes `detalles_pedido`.
    - Los tratamientos seleccionados se guardan en la tabla relacional `detalles_pedido_tratamientos`.

## Estructura de Directorios

- `/app`: Rutas del sistema (Admin, Tienda, API).
- `/components`: Componentes reutilizables (Modales, Filtros, Cards).
- `/lib`: Utilidades y configuración de Prisma (`db.ts`).
- `/prisma`: Esquema de la base de datos y scripts de seeding.
- `/docs`: Documentación técnica (este directorio).
- `/scripts`: Scripts de mantenimiento y limpieza de datos.

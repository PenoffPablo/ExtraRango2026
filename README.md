# ExtraRango - Ecommerce Óptico B2B

ExtraRango es una plataforma avanzada de cotización y venta de cristales ópticos para laboratorios y ópticas.

## 🚀 Documentación Técnica

He organizado la documentación del proyecto en los siguientes manuales específicos para facilitar su mantenimiento:

- 🏗️ **[Arquitectura del Sistema](docs/ARCHITECTURE.md)**: Stack tecnológico y flujos de datos.
- ⚖️ **[Reglas de Negocio](docs/BUSINESS_RULES.md)**: Cotización, compatibilidad de materiales y validaciones ópticas.
- 📊 **[Esquema de Base de Datos](docs/DATABASE_SCHEMA.md)**: Modelos de Prisma y estructura relacional.
- 🧪 **[Arsenal de Testing](docs/TESTING.md)**: Guía para ejecutar y crear pruebas automatizadas con Vitest.

## 🛠️ Instalación y Desarrollo

1.  **Clonar el repositorio**:
    ```bash
    git clone [url-del-repositorio]
    cd extrarango
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar base de datos**:
    - Crea un archivo `.env` basado en `.env.example` (si existe) con tu `DATABASE_URL`.
    - Sincroniza el esquema:
    ```bash
    npx prisma db push
    ```

4.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

5.  **Ejecutar Tests**:
    ```bash
    npm test
    ```

## ✨ Características Principales

- **Cotización Dinámica**: Precios en ARS basados en cotización de dolar diaria.
- **Configurador Óptico**: Soporte para Prisma, Adición (ADD) y validación de Potencia Meridional.
- **Medidas de Armazón**: Captura de distancias físicas (A, B, ED, DBL) para montajes precisos.
- **Carrito Inteligente**: Desdoblamiento automático de pedidos por ojo para laboratorio.

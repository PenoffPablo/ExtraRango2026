import db from "../lib/db";

const productService = {

    async getAll(page: number = 1) {
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const [productos, totalProductos] = await Promise.all([
            db.productos.findMany({
                take: pageSize,
                skip: skip,
                orderBy: { linea: 'asc' }
            }),
            db.productos.count()
        ]);

        const totalPages = Math.ceil(totalProductos / pageSize);

        return {
            productos,
            totalPages,
            currentPage: page,
            totalItems: totalProductos
        };
    },

    async getAllRaw() {
        return await db.productos.findMany({
            orderBy: { nombre: 'asc' }
        });
    }
};

export default productService;
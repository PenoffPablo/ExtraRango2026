import { db } from "../lib/db";

const productService = {
    async getAll() {
        return await db.productos.findMany({
            orderBy: { nombre: 'asc' }
        });
    }
};

export default productService;
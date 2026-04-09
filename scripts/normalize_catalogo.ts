import fs from 'fs';
import path from 'path';

const catalogoPath = path.join(process.cwd(), 'prisma', 'catalogo.json');
const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf-8'));

const updatedCatalogo = catalogo.map((item: any) => {
    if (item.suma_max_pos === undefined) {
        item.suma_max_pos = item.esfera_hasta;
    }
    if (item.suma_max_neg === undefined) {
        item.suma_max_neg = item.esfera_desde;
    }

    if (item.cilindro_hasta < 0) {
        item.cilindro_hasta = Math.abs(item.cilindro_hasta);
    }

    delete item.estado;
    delete item.imagen_url;

    return item;
});

fs.writeFileSync(catalogoPath, JSON.stringify(updatedCatalogo, null, 4));
console.log('✅ catalogo.json normalizado con éxito.');

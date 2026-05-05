import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  // 2 minutos de margen para compilación en modo DEV
  test.setTimeout(120000);

  test('Flujo de compra completo y estable (UI Real)', async ({ page }) => {
    // 1. Registro e Identidad
    const uniqueId = Date.now();
    const userEmail = `e2e-${uniqueId}@test.com`;

    await page.goto('/registro');
    await page.getByPlaceholder('Nombre').fill('TestUser');
    await page.getByPlaceholder('Apellido').fill('E2E');
    await page.getByPlaceholder('Correo Electrónico').fill(userEmail);
    await page.getByPlaceholder('Teléfono / WhatsApp').fill('1234567890');
    await page.getByPlaceholder('CUIL / CUIT (Sin guiones)').fill(`20${uniqueId.toString().slice(-8)}9`);
    await page.getByPlaceholder('Calle').fill('Falsa 123');
    await page.getByPlaceholder('Nro').fill('123');
    await page.getByPlaceholder('Crea tu contraseña').fill('password123');

    await page.getByRole('button', { name: /Finalizar Registro/i }).click();

    // Redirección automática al Login
    await page.waitForURL('**/login');
    await page.locator('input[type="email"]').fill(userEmail);
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /INGRESAR/i }).click();

    // 2. Navegación al Catálogo
    await page.waitForURL('**/');

    // 3. Selección de Producto
    await page.getByPlaceholder('Buscar producto...').fill('Stock');
    // Esperamos a que el filtrado ocurra (debounce de búsqueda)
    await page.waitForTimeout(800);

    const cotizarBtn = page.getByRole('button', { name: /Cotizar/i }).first();
    await cotizarBtn.click();

    // 4. Modal de Receta (Blindaje de Animación)
    await page.getByRole('button', { name: 'Ojo Derecho' }).click();
    // Verificamos que el estado de React cambió antes de interactuar
    await expect(page.getByText('Ojo Izquierdo (OI)')).not.toBeVisible();

    const modal = page.locator('.fixed.inset-0');
    await modal.locator('input[type="number"]').nth(0).fill('0'); // Esfera
    await modal.locator('input[type="number"]').nth(1).fill('0'); // Cilindro

    if (await page.locator('input[placeholder="Ej: +2.00"]').isVisible()) {
      await page.locator('input[placeholder="Ej: +2.00"]').first().fill('2.00');
    }

    await page.getByRole('button', { name: /Agregar al Pedido/i }).click();

    // Esperar cierre de modal (importante por los setTimeouts de UI)
    await expect(modal).not.toBeVisible();

    // 5. Gestión del Carrito (Acceso Robusto)
    // Buscamos el botón del carrito en el Header por su rol y contenido
    const cartButton = page.getByRole('button', { name: '1' });
    await cartButton.click();

    // Cambiamos el selector de texto genérico por uno de Rol + Nombre exacto
    await expect(page.getByRole('heading', { name: /Tu Pedido/i })).toBeVisible();

    // 6. Selección de Factura y Logística (Aquí fallaba originalmente)
    // Usamos RegEx para que sea insensible a mayúsculas y espacios extra
    const btnFacturaA = page.getByRole('button', { name: /Factura A/i });
    const btnOca = page.getByRole('button', { name: /OCA/i });

    // Aseguramos que el elemento sea clickeable (espera automática de Playwright)
    await btnFacturaA.click();
    await btnOca.click();

    // 7. Transición a Revisión
    await page.getByRole('button', { name: /REVISAR PEDIDO/i }).click();

    // 8. Intercepción de API (Mocking para no ensuciar MySQL)
    await page.route('**/api/pedidos', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          pedidoId: 99999,
          total_ars: 150000
        })
      });
    });

    // 9. Confirmación Final
    await expect(page.getByRole('heading', { name: 'Confirmar Pedido' })).toBeVisible();
    await page.getByRole('button', { name: /CONFIRMAR PEDIDO/i }).click();

    // 10. Éxito
    await expect(page.getByText('¡Pedido Confirmado!')).toBeVisible();
  });
});
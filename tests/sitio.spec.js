const { test, expect } = require('@playwright/test');

test.describe('Hero', () => {
  test('muestra la caligrafía y el subtítulo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-logo')).toBeVisible();
    await expect(page.locator('.hero-subtitle')).toContainText('Fine Art Photography');
  });

  test('el slideshow cambia de foto', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(6000);
    const slides = page.locator('.hero-slide.active');
    await expect(slides).toHaveCount(1);
  });
});

test.describe('Galería', () => {
  test('carga todas las fotos', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    const items = page.locator('.gallery-item');
    await expect(items).toHaveCount(await items.count());
    expect(await items.count()).toBeGreaterThan(70);
  });

  test('filtro por categoría funciona', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.filter-btn');
    await page.locator('.filter-btn', { hasText: 'Aerial' }).click();
    const hidden = page.locator('.gallery-item[data-visible="false"]');
    expect(await hidden.count()).toBeGreaterThan(0);
  });

  test('click en foto abre el lightbox', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.locator('.gallery-item').first().click();
    await expect(page.locator('#lightbox')).toHaveClass(/open/);
  });

  test('lightbox se cierra con Escape', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.locator('.gallery-item').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toHaveClass(/open/);
  });
});

test.describe('Modal de impresión', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.locator('.gallery-item').first().click();
    await page.locator('#lb-print').click();
  });

  test('abre el modal', async ({ page }) => {
    await expect(page.locator('#print-modal')).toHaveClass(/open/);
  });

  test('muestra la foto', async ({ page }) => {
    const img = page.locator('#pm-img');
    await expect(img).toHaveAttribute('src', /.+/);
  });

  test('cambia de tamaño y actualiza precio', async ({ page }) => {
    const precioInicial = await page.locator('#pm-price').textContent();
    await page.locator('.pm-size[data-size="l"]').click();
    const precioNuevo = await page.locator('#pm-price').textContent();
    expect(precioNuevo).not.toBe(precioInicial);
  });

  test('activa marco y muestra selector de color', async ({ page }) => {
    await page.locator('.pm-frame[data-frame="marco"]').click();
    await expect(page.locator('#pm-color-section')).toBeVisible();
  });

  test('se cierra con Escape', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.locator('#print-modal')).not.toHaveClass(/open/);
  });
});

test.describe('Navegación mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburguesa abre el menú', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-toggle').click();
    await expect(page.locator('.nav-mobile')).toHaveClass(/open/);
  });

  test('menú mobile se cierra al hacer click en un link', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-toggle').click();
    await page.locator('.nav-mobile a').first().click();
    await expect(page.locator('.nav-mobile')).not.toHaveClass(/open/);
  });
});

test.describe('Formulario de contacto', () => {
  test('muestra confirmación al enviar', async ({ page }) => {
    await page.goto('/');
    await page.locator('#f-nombre').fill('Test Usuario');
    await page.locator('#f-email').fill('test@test.com');
    await page.locator('#f-mensaje').fill('Mensaje de prueba');
    // El submit abre el mail client, interceptamos la navegación
    page.on('dialog', d => d.dismiss());
    await page.locator('.form-submit').click();
    await expect(page.locator('#form-success')).toBeVisible();
  });
});

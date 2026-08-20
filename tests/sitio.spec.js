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
    expect(await items.count()).toBeGreaterThan(70);
  });

  test('las filas justificadas asignan tamaño a cada foto', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    const first = page.locator('.gallery-item').first();
    await expect(first).toHaveAttribute('style', /width:\s*\d+px/);
    await expect(first).toHaveAttribute('style', /height:\s*\d+px/);
  });

  test('filtro por categoría funciona', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.filter-btn');
    await page.locator('.filter-btn', { hasText: 'Aerial' }).click();
    const hidden = page.locator('.gallery-item[data-visible="false"]');
    expect(await hidden.count()).toBeGreaterThan(0);
  });

  test('el filtro relayouta las fotos visibles', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.filter-btn');
    await page.locator('.filter-btn', { hasText: 'Aerial' }).click();
    const visible = page.locator('.gallery-item[data-visible="true"]').first();
    await expect(visible).toHaveAttribute('style', /width:\s*\d+px/);
  });
});

test.describe('Visor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.locator('.gallery-item').first().click();
  });

  test('click en foto abre el visor', async ({ page }) => {
    const modal = page.locator('#print-modal');
    await expect(modal).toHaveClass(/open/);
    await expect(modal).not.toHaveClass(/options/);
    await expect(page.locator('.pm-viewer-bar')).toBeVisible();
    await expect(page.locator('#pm-vb-options')).toBeVisible();
  });

  test('muestra la foto', async ({ page }) => {
    await expect(page.locator('#pm-img')).toHaveAttribute('src', /.+/);
  });

  test('navega a la siguiente y anterior foto', async ({ page }) => {
    const img = page.locator('#pm-img');
    const srcInicial = await img.getAttribute('src');
    await page.locator('#pm-next').click();
    await expect(img).not.toHaveAttribute('src', srcInicial);
    await page.locator('#pm-prev').click();
    await expect(img).toHaveAttribute('src', srcInicial);
  });

  test('se cierra con Escape', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.locator('#print-modal')).not.toHaveClass(/open/);
  });
});

test.describe('Panel de opciones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.locator('.gallery-item').first().click();
    await page.locator('#pm-vb-options').click();
  });

  test('"Ver opciones" muestra el panel', async ({ page }) => {
    await expect(page.locator('#print-modal')).toHaveClass(/options/);
    await expect(page.locator('#pm-price')).toBeVisible();
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

  test('"Ver foto completa" vuelve al visor', async ({ page }) => {
    await page.locator('#pm-back').click();
    const modal = page.locator('#print-modal');
    await expect(modal).not.toHaveClass(/options/);
    await expect(modal).toHaveClass(/open/);
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

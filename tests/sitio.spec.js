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
    // Abrimos una foto 2:3 a propósito: la primera de la grilla podría ser
    // cuadrada, y entonces no existiría el tamaño 'l'.
    await page.evaluate(() => { openViewer('LND-001'); });
    await page.locator('#pm-vb-options').click();
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

test.describe('Categorías múltiples', () => {
  test('una foto en dos categorías aparece en ambos filtros', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.filter-btn');
    const generalitat = page.locator('.gallery-item[data-code="STR-006"]');

    await page.locator('.filter-btn', { hasText: 'Street' }).click();
    await expect(generalitat).toHaveAttribute('data-visible', 'true');

    await page.locator('.filter-btn', { hasText: 'B&N' }).click();
    await expect(generalitat).toHaveAttribute('data-visible', 'true');
  });

  test('una foto en dos categorías aparece una sola vez en la grilla', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    const repetidos = await page.evaluate(() => {
      const codes = [...document.querySelectorAll('.gallery-item')].map(e => e.dataset.code);
      return codes.filter((c, i) => codes.indexOf(c) !== i);
    });
    expect(repetidos).toEqual([]);
  });

  test('la grilla tiene tantas fotos como PHOTOS', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    const { enGrilla, enDatos } = await page.evaluate(() => ({
      enGrilla: document.querySelectorAll('.gallery-item').length,
      enDatos:  PHOTOS.length,
    }));
    expect(enGrilla).toBe(enDatos);
  });

  test('el filtro B&N incluye fotos de varias categorías nativas', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    const nativas = await page.evaluate(() =>
      [...new Set(PHOTOS.filter(p => photoCats(p).includes('bw'))
                        .map(p => photoCats(p).find(c => c !== 'bw')))].filter(Boolean)
    );
    expect(nativas.length).toBeGreaterThan(1);
  });
});

test.describe('Formato cuadrado', () => {
  test('una foto cuadrada solo ofrece tamaños cuadrados', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.evaluate(() => { openViewer('SEA-006'); });
    await page.locator('#pm-vb-options').click();

    const labels = await page.locator('.pm-size').allTextContents();
    expect(labels).toEqual(['30 × 30 cm', '45 × 45 cm', '60 × 60 cm']);
  });

  test('una foto 2:3 ofrece los tamaños de siempre', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.evaluate(() => { openViewer('LND-001'); });
    await page.locator('#pm-vb-options').click();

    const labels = await page.locator('.pm-size').allTextContents();
    expect(labels).toEqual(['20 × 30 cm', '40 × 60 cm', '60 × 90 cm']);
  });

  test('al cambiar de foto los tamaños se rearman', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.evaluate(() => { openViewer('SEA-006'); });
    await page.locator('#pm-vb-options').click();
    await expect(page.locator('.pm-size').first()).toHaveText('30 × 30 cm');

    await page.evaluate(() => { setPmPhoto(PHOTOS.find(p => p.code === 'LND-001')); });
    await expect(page.locator('.pm-size').first()).toHaveText('20 × 30 cm');
  });

  test('la nota de medidas usa el tamaño cuadrado', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.evaluate(() => { openViewer('SEA-006'); });
    await page.locator('#pm-vb-options').click();
    // 30×30 + 2 cm de marco por lado
    await expect(page.locator('#pm-size-note')).toContainText('34 × 34 cm');
  });
});

test.describe('Admin', () => {
  // Entramos por sessionStorage para no dejar la contraseña escrita en el repo.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('gw-admin', '1'));
    await page.goto('/admin.html');
    await page.waitForFunction(() => typeof photos !== 'undefined' && photos.length > 0);
  });

  test('el data.js que genera conserva categories y ratio', async ({ page }) => {
    const generado = await page.evaluate(() => generateDataJs());
    expect(generado).toContain("categories:['seascape','bw']");
    expect(generado).toContain("ratio:'1:1'");
  });

  test('el data.js que genera incluye los helpers', async ({ page }) => {
    const generado = await page.evaluate(() => generateDataJs());
    expect(generado).toContain('function photoCats');
    expect(generado).toContain('function sizesFor');
  });

  test('el data.js que genera conserva el ratio de los tamaños', async ({ page }) => {
    const generado = await page.evaluate(() => generateDataJs());
    expect(generado).toContain("ratio:'2:3'");
    expect(generado).toMatch(/id:'sq-s'[^}]*ratio:'1:1'/);
  });

  test('las categorías se editan como selección múltiple', async ({ page }) => {
    const chips = page.locator('.cat-chips').first();
    await expect(chips).toBeVisible();
    expect(await chips.locator('input[type="checkbox"]').count()).toBeGreaterThan(1);
  });
});

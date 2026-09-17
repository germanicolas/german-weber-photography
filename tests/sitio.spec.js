const { test, expect } = require('@playwright/test');

test.describe('Hero', () => {
  test('muestra la caligrafía y el subtítulo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-logo img')).toBeVisible();
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

test.describe('Velocidad de carga', () => {
  test('la galería usa miniaturas con carga diferida', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    const img = page.locator('.gallery-item img').first();
    await expect(img).toHaveAttribute('loading', 'lazy');
    await expect(img).toHaveAttribute('srcset', /images\/thumbs\/sm\/.+ \d+w, images\/thumbs\/md\/.+ \d+w/);
  });

  test('al abrir la página no se descargan todas las fotos', async ({ page }) => {
    const pedidas = new Set();
    page.on('request', r => { if (/\.(jpe?g|png)(\?|$)/i.test(r.url())) pedidas.add(r.url()); });
    await page.goto('/');
    await page.waitForLoadState('load');
    const total = await page.evaluate(() => PHOTOS.length);
    expect(pedidas.size).toBeLessThan(total / 2);
    // Ninguna foto de 2000 px de la galería se pide para la grilla
    const originalesGrilla = [...pedidas].filter(u => /images\/mockups\//.test(u));
    expect(originalesGrilla).toEqual([]);
  });

  test('las miniaturas existen para las fotos visibles', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.locator('.gallery-item img').first().scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('.gallery-item img').first()
      .evaluate(i => i.complete && i.naturalWidth > 0 && i.currentSrc.includes('/thumbs/'))).toBe(true);
  });

  test('el hero no descarga todas sus fotos de entrada', async ({ page }) => {
    await page.goto('/');
    const conFondo = await page.evaluate(() =>
      [...document.querySelectorAll('.hero-slide')].filter(s => s.style.backgroundImage).length);
    const total = await page.locator('.hero-slide').count();
    expect(conFondo).toBeLessThanOrEqual(Math.min(2, total));
  });
});

test.describe('Archivos no publicados', () => {
  const fs = require('fs');
  const path = require('path');
  const raiz = path.join(__dirname, '..');

  test('_config.yml deja fuera el admin y los archivos de desarrollo', async () => {
    const cfg = fs.readFileSync(path.join(raiz, '_config.yml'), 'utf8');
    for (const f of ['admin.html', 'tests', 'tools', 'node_modules', 'package.json']) {
      expect(cfg).toContain(`- ${f}`);
    }
  });

  test('admin.html no tiene la clave en texto plano', async () => {
    const admin = fs.readFileSync(path.join(raiz, 'admin.html'), 'utf8');
    expect(admin).not.toMatch(/simpleHash\(\s*['"]/);
  });
});

test.describe('SEO y vista previa al compartir', () => {
  test('tiene og:image absoluta y la imagen existe', async ({ page, request }) => {
    await page.goto('/');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toMatch(/^https:\/\/germanweber\.cl\/images\/.+\.jpg$/);
    const local = await request.get('/' + og.replace('https://germanweber.cl/', ''));
    expect(local.status()).toBe(200);
  });

  test('tiene canonical y datos estructurados válidos', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://germanweber.cl/');
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    expect(ld['@graph'].map(n => n['@type'])).toEqual(['Person', 'WebSite']);
  });

  test('robots.txt apunta al sitemap', async ({ request }) => {
    const r = await request.get('/robots.txt');
    expect(r.status()).toBe(200);
    expect(await r.text()).toContain('Sitemap: https://germanweber.cl/sitemap.xml');
  });

  test('sitemap.xml incluye todas las fotos', async ({ page, request }) => {
    await page.goto('/');
    const total = await page.evaluate(() => PHOTOS.length);
    const xml = await (await request.get('/sitemap.xml')).text();
    expect((xml.match(/<image:image>/g) || []).length).toBe(total);
  });
});

test.describe('WhatsApp', () => {
  const NUMERO = '56911112222';
  // Reemplaza el número de main.js para probar con y sin WhatsApp, sin depender del real.
  const usarNumero = async (page, numero) => {
    await page.route('**/js/main.js*', async route => {
      const r = await route.fetch();
      const body = (await r.text()).replace(/var WHATSAPP = '\d*';/, `var WHATSAPP = '${numero}';`);
      await route.fulfill({ response: r, body });
    });
  };
  const conNumero = page => usarNumero(page, NUMERO);

  test('main.js tiene un número de WhatsApp válido', async () => {
    const main = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'main.js'), 'utf8');
    expect(main).toMatch(/var WHATSAPP = '569\d{8}';/);
  });

  test('sin número, los botones de WhatsApp no aparecen', async ({ page }) => {
    await usarNumero(page, '');
    await page.goto('/');
    await page.evaluate(() => { openViewer('LND-001'); });
    await page.locator('#pm-vb-options').click();
    await expect(page.locator('#pm-wa')).toBeHidden();
    await expect(page.locator('#pm-submit')).toBeVisible();
    await expect(page.locator('#contact-wa')).toBeHidden();
  });

  test('con número, el pedido va con foto, tamaño y precio', async ({ page }) => {
    await conNumero(page);
    await page.goto('/');
    await page.evaluate(() => { openViewer('LND-001'); });
    await page.locator('#pm-vb-options').click();
    await page.locator('.pm-size[data-size="m"]').click();
    await page.locator('.pm-frame[data-frame="marco"]').click();

    const wa = page.locator('#pm-wa');
    await expect(wa).toBeVisible();
    await expect(page.locator('#pm-submit')).toHaveClass(/is-secondary/);
    const href = await wa.getAttribute('href');
    expect(href.startsWith(`https://wa.me/${NUMERO}?text=`)).toBe(true);
    const texto = decodeURIComponent(href.split('?text=')[1]);
    const precio = await page.locator('#pm-price').textContent();
    expect(texto).toContain('(LND-001)');
    expect(texto).toContain('40 × 60 cm');
    expect(texto).toContain('Con marco');
    expect(texto).toContain(precio);
  });

  test('con número, aparece WhatsApp en contacto', async ({ page }) => {
    await conNumero(page);
    await page.goto('/');
    await expect(page.locator('#contact-wa')).toBeVisible();
    await expect(page.locator('#contact-wa')).toHaveAttribute('href', new RegExp(`^https://wa\\.me/${NUMERO}\\?text=`));
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

  test('Contacto visible arriba a la derecha', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links a[href="#contact"]')).toBeVisible();
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

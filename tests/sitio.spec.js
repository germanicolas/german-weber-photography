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

test.describe('Ambientes (videos y escenas)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.amb-card');
  });

  test('hay una tarjeta por escena de js/ambientes.js', async ({ page }) => {
    const esperadas = await page.evaluate(() =>
      AMBIENTES.filter(a => PHOTOS.some(p => p.code === a.code)).length);
    expect(esperadas).toBeGreaterThan(0);
    await expect(page.locator('.amb-card')).toHaveCount(esperadas);
    expect(await page.locator('.amb-card.is-video').count()).toBeGreaterThan(0);
  });

  test('los videos no se descargan al abrir la página', async ({ page }) => {
    const conSrc = await page.evaluate(() =>
      [...document.querySelectorAll('.amb-card video')].filter(v => v.getAttribute('src')).length);
    expect(conSrc).toBe(0);
  });

  test('todos los archivos de ambientes existen', async ({ page, request }) => {
    const rutas = await page.evaluate(() =>
      AMBIENTES.flatMap(a => [a.video, a.poster, a.foto, a.foto_sm, a.horiz, a.horiz_sm].filter(Boolean)));
    for (const ruta of rutas) {
      const r = await request.head('/' + ruta);
      expect(r.status(), ruta).toBe(200);
    }
  });

  test('el servidor local responde rangos (Safari los necesita para video)', async ({ page, request }) => {
    const video = await page.evaluate(() => AMBIENTES.find(a => a.video).video);
    const r = await request.get('/' + video, { headers: { Range: 'bytes=0-99' } });
    expect(r.status()).toBe(206);
    expect((await r.body()).length).toBe(100);
  });

  test('click en una escena abre el visor en esa escena', async ({ page }) => {
    await page.locator('.amb-card.is-video').first().click();
    await expect(page.locator('#print-modal')).toHaveClass(/open/);
    await expect(page.locator('#pm-amb-video')).toBeVisible();
    await expect(page.locator('#pm-frame-wrap')).toBeHidden();
    await expect(page.locator('#pm-amb-cap')).toContainText('ambiente recreado');
    await expect(page.locator('.pm-thumb.active')).not.toHaveCount(0);
    expect(await page.evaluate(() => pmVista)).toBeGreaterThan(0);
  });

  test('la primera miniatura vuelve a la foto y detiene el video', async ({ page }) => {
    await page.locator('.amb-card.is-video').first().click();
    await page.locator('.pm-thumb').first().click();
    await expect(page.locator('#pm-frame-wrap')).toBeVisible();
    await expect(page.locator('#pm-amb')).toBeHidden();
    expect(await page.evaluate(() => document.getElementById('pm-amb-video').paused)).toBe(true);
  });

  test('"Ver opciones" muestra la foto sola para simular el marco', async ({ page }) => {
    await page.locator('.amb-card:not(.is-video)').first().click();
    await expect(page.locator('#pm-amb-img')).toBeVisible();
    await page.locator('#pm-vb-options').click();
    await expect(page.locator('#pm-frame-wrap')).toBeVisible();
    await expect(page.locator('#pm-amb')).toBeHidden();
  });

  test('una foto con mockups de Smartist los muestra como miniaturas', async ({ page }) => {
    const p = await page.evaluate(() => PHOTOS.find(x => x.mockup && x.mockup2).code);
    await page.evaluate(code => openViewer(code), p);
    await expect(page.locator('.pm-thumb')).toHaveCount(3);
  });

  test('una foto sin mockups ni ambientes no muestra miniaturas', async ({ page }) => {
    const p = await page.evaluate(() =>
      PHOTOS.find(x => !x.mockup && !AMBIENTES.some(a => (a.codes || [a.code]).includes(x.code))).code);
    await page.evaluate(code => openViewer(code), p);
    await expect(page.locator('#pm-thumbs')).toBeHidden();
    await expect(page.locator('#pm-frame-wrap')).toBeVisible();
  });

  test('se abre la foto correcta aunque el filtro activo no la incluya', async ({ page }) => {
    const a = await page.evaluate(() => AMBIENTES[0]);
    const cat = await page.evaluate(code => {
      const p = PHOTOS.find(x => x.code === code);
      return CATEGORIES.find(c => c.id !== 'all' && !photoCats(p).includes(c.id)).id;
    }, a.code);
    await page.locator(`.filter-btn[data-cat="${cat}"]`).click();
    // Con ese filtro su tarjeta queda oculta, pero el visor igual debe abrir la foto correcta
    await expect(page.locator(`.amb-card[data-code="${a.code}"]`).first()).toBeHidden();
    await page.evaluate(code => openViewer(code, 1), a.code);
    expect(await page.evaluate(() => pmPhoto.code)).toBe(a.code);
  });

  test('con un filtro activo solo se ven los ambientes de esa categoría', async ({ page }) => {
    await page.locator('.filter-btn[data-cat="aerial"]').click();
    const cats = await page.evaluate(() =>
      [...document.querySelectorAll('.amb-card')].filter(c => c.dataset.visible !== 'false').map(c => c.dataset.category));
    for (const c of cats) expect(c.split(' ')).toContain('aerial');
  });

  test('una escena con varias fotos aparece en el visor de cada una', async ({ page }) => {
    const a = await page.evaluate(() => AMBIENTES.find(x => x.codes));
    for (const code of a.codes) {
      await page.evaluate(c => openViewer(c), code);
      await expect(page.locator(`.pm-thumb[aria-label="Ambiente: ${a.lugar}"]`)).toHaveCount(1);
      await page.keyboard.press('Escape');
    }
  });

  test('la tarjeta usa 16:9 en computador y 4:5 en el teléfono', async ({ page }, info) => {
    const a = await page.evaluate(() => AMBIENTES.find(x => x.horiz && x.foto));
    const img = page.locator(`.amb-card[data-code="${a.code}"] img`);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(i => i.currentSrc)).toContain(
      info.project.name === 'mobile' ? a.foto_sm : a.horiz_sm);
    const caja = await page.locator(`.amb-card[data-code="${a.code}"] .amb-media`).boundingBox();
    const r = caja.width / caja.height;
    if (info.project.name === 'mobile') expect(r).toBeCloseTo(0.8, 1);
    else expect(r).toBeCloseTo(16 / 9, 1);
  });

  test('al cerrar el visor se detiene su video', async ({ page }) => {
    await page.locator('.amb-card.is-video').first().click();
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.getElementById('pm-amb-video').paused)).toBe(true);
  });
});

test.describe('Accesibilidad con teclado (014)', () => {
  test('una foto de la galería se abre con Enter y el foco vuelve al cerrar', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    const foto = page.locator('.gallery-item').first();
    await expect(foto).toHaveAttribute('role', 'button');
    await foto.focus();
    await page.keyboard.press('Enter');
    const modal = page.locator('#print-modal');
    await expect(modal).toHaveClass(/open/);
    await expect(page.locator('.print-modal-inner')).toBeFocused();
    expect(await page.evaluate(() => document.getElementById('gallery').inert)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/open/);
    await expect(foto).toBeFocused();
    expect(await page.evaluate(() => document.getElementById('gallery').inert)).toBe(false);
  });

  test('los botones de opciones indican cuál está elegido', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.locator('.gallery-item').first().click();
    await page.locator('#pm-vb-options').click();
    await page.locator('.pm-frame[data-frame="marco"]').click();
    await expect(page.locator('.pm-frame[data-frame="marco"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.pm-frame[data-frame="sin"]')).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('Formulario que no pierde el mensaje (016)', () => {
  test('al enviar conserva lo escrito y ofrece copiarlo', async ({ page }) => {
    await page.goto('/');
    await page.locator('#f-nombre').fill('Test Usuario');
    await page.locator('#f-email').fill('test@test.com');
    await page.locator('#f-mensaje').fill('Mensaje de prueba');
    await page.locator('.form-submit').click();
    await expect(page.locator('#form-success')).toBeVisible();
    await expect(page.locator('#f-mensaje')).toHaveValue('Mensaje de prueba');
    await expect(page.locator('#form-copy')).toHaveAttribute('data-texto', /Test Usuario[\s\S]*Mensaje de prueba/);
  });
});

test.describe('Galería solo con fotos (017)', () => {
  test('la grilla muestra la foto y no el mockup', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    const conMockup = await page.evaluate(() =>
      [...document.querySelectorAll('.gallery-item img')].filter(i => /mockups\//.test(i.dataset.full)).length);
    expect(conMockup).toBe(0);
  });

  test('los ambientes van repartidos entre las fotos de la grilla', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.amb-card');
    const r = await page.evaluate(() => {
      const hijos = [...document.getElementById('gallery-grid').children];
      const pos = hijos.map((el, i) => el.classList.contains('amb-card') ? i : -1).filter(i => i >= 0);
      return { primera: pos[0], total: hijos.length, pegadas: pos.some((p, k) => k && p === pos[k - 1] + 1) };
    });
    expect(r.primera).toBeLessThan(8);             // se ve en las primeras filas
    expect(r.pegadas).toBe(false);                 // nunca dos ambientes seguidos
    await expect(page.locator('#ambientes')).toHaveCount(0);   // ya no hay sección aparte al final
  });
});

test.describe('Tanda 2 (004, 005, 018, 019, 008)', () => {
  test('004: el visor entra con fundido y al cerrar se va', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.locator('.gallery-item').first().click();
    const modal = page.locator('#print-modal');
    await expect(modal).toHaveClass(/visible/);
    await expect.poll(() => modal.evaluate(m => getComputedStyle(m).opacity)).toBe('1');
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/visible/);
    await expect(modal).not.toHaveClass(/open/);
    await expect(modal).toBeHidden();
  });

  test('004: abrir y cerrar muy rápido no deja el visor trabado', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gallery-item');
    await page.evaluate(() => { openViewer(PHOTOS[0].code); closePrintModal(); openViewer(PHOTOS[1].code); });
    await page.waitForTimeout(400);
    await expect(page.locator('#print-modal')).toHaveClass(/open/);
    await expect(page.locator('#print-modal')).toHaveClass(/visible/);
  });

  test('005: con "Reducir movimiento" no hay scroll suave ni panel que se desliza', async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
    if (info.project.name === 'desktop') {
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('.pm-body')).transform)).toBe('none');
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');
  });

  test('018: hay un h1 y el Portfolio tiene su h2', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h2', { hasText: 'Portfolio' })).toHaveCount(1);
  });

  test('019: en el teléfono la portada usa la miniatura md', async ({ page }, info) => {
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.querySelector('.hero-slide').style.backgroundImage)).not.toBe('');
    const bg = await page.evaluate(() => document.querySelector('.hero-slide').style.backgroundImage);
    if (info.project.name === 'mobile') expect(bg).toContain('/thumbs/md/');
    else expect(bg).not.toContain('/thumbs/');
  });

  test('008: el slideshow se detiene cuando la portada no se ve', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const antes = await page.evaluate(() => [...document.querySelectorAll('.hero-slide')].findIndex(s => s.classList.contains('active')));
    await page.waitForTimeout(6000);
    const despues = await page.evaluate(() => [...document.querySelectorAll('.hero-slide')].findIndex(s => s.classList.contains('active')));
    expect(despues).toBe(antes);
  });
});

test.describe('Ícono del sitio (013)', () => {
  test('declara favicon, SVG e ícono de iPhone, y los archivos existen', async ({ page, request }) => {
    await page.goto('/');
    const rutas = await page.evaluate(() =>
      [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')].map(l => l.getAttribute('href')));
    expect(rutas).toEqual(['favicon.ico', 'images/icon.svg', 'images/apple-touch-icon.png']);
    for (const ruta of rutas) {
      const r = await request.get('/' + ruta);
      expect(r.status(), ruta).toBe(200);
    }
  });
});

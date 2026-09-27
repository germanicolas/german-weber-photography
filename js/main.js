/* ── WhatsApp ── */
// Número solo con dígitos y código de país, ej: '56912345678'.
// Vacío = los botones de WhatsApp quedan ocultos y solo se ofrece el correo.
var WHATSAPP = '56962964266';

function waLink(text) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

(function () {
  if (!WHATSAPP) return;
  document.querySelectorAll('.wa-only, #pm-wa').forEach(el => { el.hidden = false; });
  document.getElementById('pm-submit')?.classList.add('is-secondary');
  const contactWa = document.getElementById('contact-wa');
  if (contactWa) contactWa.href = waLink('Hola German, te escribo desde tu web.');
})();

const footerYear = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ── Apply editable texts ── */
(function () {
  if (typeof TEXTS === 'undefined') return;
  var map = {
    'text-tienda-desc':  { el: document.getElementById('text-tienda-desc'),  html: TEXTS.tiendaDesc },
    'text-about-p1':     { el: document.getElementById('text-about-p1'),     html: TEXTS.aboutP1 },
    'text-about-p2':     { el: document.getElementById('text-about-p2'),     html: TEXTS.aboutP2 },
    'text-about-p3':     { el: document.getElementById('text-about-p3'),     html: TEXTS.aboutP3 },
    'text-contact-desc': { el: document.getElementById('text-contact-desc'), html: TEXTS.contactDesc },
  };
  Object.values(map).forEach(function(entry) {
    if (entry.el && entry.html !== undefined) entry.el.innerHTML = entry.html;
  });

  // Stats calculados automáticamente desde PHOTOS
  var statImgEl    = document.getElementById('stat-img');
  var statPaisesEl = document.getElementById('stat-paises');
  var statLeEl     = document.getElementById('stat-le');
  if (statImgEl)    statImgEl.textContent    = PHOTOS.filter(function(p){ return p.available; }).length;
  if (statLeEl)     statLeEl.textContent     = PHOTOS.filter(function(p){ return p.limitedEdition; }).length;
  if (statPaisesEl) {
    var paises = new Set(PHOTOS.map(function(p) {
      var parts = p.location.split(',');
      return parts[parts.length - 1].trim();
    }));
    statPaisesEl.textContent = paises.size;
  }
})();

/* ── Nav scroll ── */
const nav = document.getElementById('nav');
const heroArrow = document.querySelector('.hero-arrow');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  heroArrow?.classList.toggle('hidden', window.scrollY > 40);
}, { passive: true });

/* ── Hero slideshow ── */
(function () {
  const isMobile = window.innerWidth < 768;
  const heroList = (isMobile && HERO_PHOTOS_MOBILE.length > 0) ? HERO_PHOTOS_MOBILE : HERO_PHOTOS;
  const heroPics = PHOTOS.filter(p => heroList.includes(p.code))
    .sort((a, b) => heroList.indexOf(a.code) - heroList.indexOf(b.code));
  const slidesEl = document.querySelector('.hero-slides');
  const dotsEl   = document.querySelector('.hero-dots');
  if (!slidesEl) return;

  heroPics.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    // En el teléfono basta la miniatura de 1400 px (~4 veces más liviana que el original)
    slide.dataset.bg = isMobile ? thumbPath(p.src, 'md') : p.src;
    slide.dataset.orig = p.src;
    slidesEl.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dotsEl.appendChild(dot);
  });

  // Cada foto del hero se descarga recién cuando le toca ser la siguiente,
  // en vez de bajar todas al abrir la página.
  const slides = slidesEl.querySelectorAll('.hero-slide');
  function loadSlide(i) {
    const s = slides[i];
    if (!s || s.dataset.pedida) return;
    s.dataset.pedida = '1';
    const img = new Image();
    img.onload = () => { s.style.backgroundImage = `url('${img.getAttribute('src')}')`; };
    // Foto nueva sin miniatura todavía: cae al original
    img.onerror = () => { if (img.getAttribute('src') !== s.dataset.orig) img.src = s.dataset.orig; };
    img.src = s.dataset.bg;
  }
  loadSlide(0);
  loadSlide(1);

  let cur = 0;
  function next() {
    const dots = dotsEl.querySelectorAll('.hero-dot');
    slides[cur].classList.remove('active');
    dots[cur].classList.remove('active');
    cur = (cur + 1) % slides.length;
    loadSlide(cur);
    slides[cur].classList.add('active');
    dots[cur].classList.add('active');
    loadSlide((cur + 1) % slides.length);
  }
  if (slides.length < 2) return;

  // Solo avanza mientras la portada se ve: así no descarga fotos que nadie mira
  let timer = null;
  let heroVisible = true;
  const arrancar = () => { if (!timer && heroVisible && !document.hidden) timer = setInterval(next, 5000); };
  const parar = () => { clearInterval(timer); timer = null; };
  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : arrancar()));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      heroVisible = e.isIntersecting;
      heroVisible ? arrancar() : parar();
    }).observe(document.getElementById('hero'));
  }
  arrancar();
})();

/* ── Miniaturas (generadas por tools/miniaturas.py) ── */
const THUMB_SIZES = { sm: 700, md: 1400 }; // lado mayor en px, igual que en el script
function thumbPath(src, size) {
  return src.replace(/^images\//, `images/thumbs/${size}/`);
}
function imgDims(src) {
  return (typeof IMG_DIMS !== 'undefined' && src && IMG_DIMS[src]) || null;
}

/* Proporción de una tarjeta de ambiente en la grilla: video 9:16; escena 16:9 en
   computador y 4:5 en el teléfono (la misma que elige su <picture>) */
function aspectoAmbiente(el) {
  if (el.classList.contains('is-video')) return 9 / 16;
  const movil = window.matchMedia('(max-width: 768px)').matches;
  if (movil) return el.classList.contains('is-v') ? 4 / 5 : 16 / 9;
  return el.classList.contains('is-h') ? 16 / 9 : 4 / 5;
}

/* ── Gallery ── */
(function () {
  const grid = document.getElementById('gallery-grid');
  const filters = document.getElementById('gallery-filters');
  if (!grid) return;

  function makeCard(p) {
    const item = document.createElement('div');
    item.className = 'gallery-item' + (p.limitedEdition ? ' le' : '');
    item.dataset.category = photoCats(p).join(' ');
    item.dataset.code = p.code;
    // Con teclado: la tarjeta recibe foco y se abre con Enter o Espacio
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `${p.title}, ${p.location}${p.limitedEdition ? ', edición limitada' : ''}`);
    if (typeof HORIZONTAL !== 'undefined' && HORIZONTAL.has(p.code)) {
      item.dataset.orientation = 'h';
    }

    const img = document.createElement('img');
    img.alt = p.title;
    img.loading = 'lazy';
    img.decoding = 'async';
    // La grilla muestra siempre la foto; los mockups se ven como miniaturas en el visor
    const full = p.src;
    img.setAttribute('data-full', full);
    const dims = imgDims(full);
    if (dims) {
      // Miniaturas de tools/miniaturas.py; el navegador elige según el ancho
      // que le asigna justifyGallery (img.sizes). Si falta una, cae al original.
      img.sizes = '25vw';
      img.srcset = Object.entries(THUMB_SIZES).map(([name, lado]) => {
        const w = Math.round(dims[0] * Math.min(1, lado / Math.max(dims[0], dims[1])));
        return `${encodeURI(thumbPath(full, name))} ${w}w`;
      }).join(', ');
      img.src = thumbPath(full, 'md');
      img.addEventListener('error', () => {
        if (img.src.includes('/thumbs/')) { img.removeAttribute('srcset'); img.src = full; }
      });
    } else {
      img.src = full; // foto nueva sin miniatura todavía
    }

    const overlay = document.createElement('div');
    overlay.className = 'gallery-item-overlay';
    overlay.innerHTML = `
      <div class="gallery-item-title">${p.title}</div>
      <div class="gallery-item-location">${p.location}</div>
    `;

    item.appendChild(img);
    item.appendChild(overlay);

    if (p.limitedEdition) {
      const badge = document.createElement('div');
      badge.className = 'gallery-item-badge';
      badge.textContent = 'Ed. Limitada';
      item.appendChild(badge);
    }

    item.addEventListener('click', () => openViewer(p.code));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(p.code); }
    });
    return item;
  }

  // Interleave photos by category for visual variety
  const catIds = CATEGORIES.filter(c => c.id !== 'all').map(c => c.id);
  const byCat  = {};
  catIds.forEach(id => { byCat[id] = PHOTOS.filter(p => photoCats(p).includes(id)); });
  const catIdx = {};
  catIds.forEach(id => { catIdx[id] = 0; });

  const mixed = [];
  let progress = true;
  while (progress) {
    progress = false;
    catIds.forEach(id => {
      if (catIdx[id] < byCat[id].length) {
        mixed.push(byCat[id][catIdx[id]++]);
        progress = true;
      }
    });
  }

  // Una foto en dos categorías entra dos veces al mezclar: dejamos la primera.
  const vistos = new Set();
  mixed.forEach(p => {
    if (vistos.has(p.code)) return;
    vistos.add(p.code);
    grid.appendChild(makeCard(p));
  });

  /* ── Layout de filas justificadas ──
     Cada fila tiene altura pareja; los anchos siguen la proporción real
     de cada foto y suman exacto el ancho del contenedor. Máx 4 por fila. */
  function justifyGallery() {
    const isMobile = window.innerWidth < 768;
    const GAP = isMobile ? 14 : 44; // debe coincidir con el gap CSS de .gallery-grid
    const TARGET_H = isMobile ? 300 : 580;
    const MAX_PER_ROW = 4;
    const W = Math.floor(grid.getBoundingClientRect().width) - 1;
    if (W <= 0) return;

    const items = [...grid.querySelectorAll('.gallery-item, .amb-card')]
      .filter(el => el.dataset.visible !== 'false');

    let row = [], aspectSum = 0;
    const flush = (isLast) => {
      if (!row.length) return;
      const gaps = GAP * (row.length - 1);
      let h = (W - gaps) / aspectSum;
      if (isLast && h > TARGET_H) h = TARGET_H; // última fila no se estira
      let used = 0;
      row.forEach((r, i) => {
        const w = (i === row.length - 1 && !isLast)
          ? W - gaps - used                     // cierra la fila exacta
          : Math.floor(r.aspect * h);
        used += w;
        r.el.style.width = w + 'px';
        r.el.style.height = Math.floor(h) + 'px';
        if (r.img) r.img.sizes = w + 'px';
      });
      row = []; aspectSum = 0;
    };
    items.forEach(el => {
      if (el.classList.contains('amb-card')) {
        row.push({ el, img: null, aspect: aspectoAmbiente(el) });
        aspectSum += row[row.length - 1].aspect;
        if (aspectSum * TARGET_H >= W - GAP * (row.length - 1) || row.length >= MAX_PER_ROW) flush(false);
        return;
      }
      const img = el.querySelector('img');
      const dims = imgDims(img.getAttribute('data-full'));
      const aspect = dims ? dims[0] / dims[1]
        : (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight
        : (el.dataset.orientation === 'h' ? 1.5 : 0.667);
      row.push({ el, img, aspect });
      aspectSum += aspect;
      if (aspectSum * TARGET_H >= W - GAP * (row.length - 1) || row.length >= MAX_PER_ROW) flush(false);
    });
    flush(true);
  }

  // Las proporciones vienen de js/thumbs.js, así el layout sale bien de inmediato.
  // Solo las fotos sin medidas (nuevas, sin miniatura) relayoutan al cargar.
  justifyGallery();
  let resizeTimer;
  grid.querySelectorAll('img').forEach(img => {
    if (imgDims(img.getAttribute('data-full'))) return;
    img.addEventListener('load', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(justifyGallery, 120);
    }, { once: true });
  });

  // Recalcular cada vez que cambie el ancho real de la galería (no solo al
  // redimensionar la ventana): al cargar, Safari puede medir un ancho provisorio.
  let lastW = Math.floor(grid.getBoundingClientRect().width);
  let rafId = 0;
  const relayout = () => {
    const w = Math.floor(grid.getBoundingClientRect().width);
    if (w === lastW) return;
    lastW = w;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(justifyGallery);
  };
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(grid);
  window.addEventListener('resize', relayout);
  window.addEventListener('load', () => { lastW = -1; relayout(); });
  grid._justify = justifyGallery; // para relayout al filtrar

  // Filters
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat.id === 'all' ? ' active' : '');
    btn.setAttribute('aria-pressed', cat.id === 'all');
    btn.dataset.cat = cat.id;
    btn.textContent = cat.label;
    btn.addEventListener('click', () => {
      filters.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      grid.querySelectorAll('.gallery-item, .amb-card').forEach(el => {
        const cats = el.dataset.category.split(' ');
        el.dataset.visible = (cat.id === 'all' || cats.includes(cat.id)) ? 'true' : 'false';
      });
      justifyGallery();
    });
    filters.appendChild(btn);
  });
})();

/* ── Vistas de una foto: la foto sola, sus mockups y sus ambientes ──
   Los ambientes (videos y escenas en casas) vienen de js/ambientes.js,
   generado por tools/ambientes.py. */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOVIL = window.matchMedia('(max-width: 768px)');

// Una escena puede mostrar varias fotos (díptico, tríptico...): codes las trae todas
const codigosDe = a => a.codes || [a.code];

// Foto fija de una escena: 16:9 en computador y 4:5 en el teléfono, si existen
function fijaDe(a) {
  const h = a.horiz && { src: a.horiz, thumb: a.horiz_sm };
  const v = a.foto && { src: a.foto, thumb: a.foto_sm };
  return MOVIL.matches ? (v || h) : (h || v);
}

function vistasDe(p) {
  const vistas = [{ tipo: 'foto', thumb: thumbPath(p.src, 'sm') }];
  [p.mockup, p.mockup2].filter(Boolean).forEach(src => {
    vistas.push({ tipo: 'img', src, thumb: thumbPath(src, 'sm') });
  });
  const ambientes = typeof AMBIENTES !== 'undefined' ? AMBIENTES.filter(a => codigosDe(a).includes(p.code)) : [];
  ambientes.forEach(a => {
    if (a.video) vistas.push({ tipo: 'video', src: a.video, poster: a.poster, thumb: a.poster, lugar: a.lugar, n: a.n });
    const f = fijaDe(a);
    // n solo en la primera vista de la escena: es la que abre su tarjeta
    if (f) vistas.push({ tipo: 'img', src: f.src, thumb: f.thumb, lugar: a.lugar, n: a.video ? null : a.n });
  });
  return vistas;
}

/* ── Ambientes: videos y escenas repartidos entre las fotos de la galería ──
   Cada tarjeta ocupa su lugar en las filas justificadas y responde a los filtros
   según las categorías de sus fotos. */
const ambSeccion = (function () {
  const grid = document.getElementById('gallery-grid');
  const nota = document.getElementById('amb-nota');
  const lista = typeof AMBIENTES !== 'undefined'
    ? AMBIENTES.filter(a => PHOTOS.some(p => p.code === a.code)) : [];
  if (!grid || !lista.length) {
    nota?.remove();
    return null;
  }

  function crearTarjeta(a) {
    const p = PHOTOS.find(x => x.code === a.code);
    const fotos = codigosDe(a).map(c => PHOTOS.find(x => x.code === c)).filter(Boolean);
    const titulo = fotos.map(f => f.title).join(' · ');
    const card = document.createElement('button');
    // is-h: tiene 16:9 (computador) · is-v: tiene 4:5 (teléfono); aspectoAmbiente() elige la proporción
    card.className = 'amb-card' + (a.video ? ' is-video' : (a.horiz ? ' is-h' : '') + (a.foto ? ' is-v' : ''));
    card.dataset.code = a.code;
    card.dataset.category = [...new Set(fotos.flatMap(photoCats))].join(' ');

    const media = document.createElement('span');
    media.className = 'amb-media';
    if (a.video) {
      // Se descarga recién cuando la tarjeta entra en pantalla
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
      ['muted', 'playsinline', 'disablepictureinpicture'].forEach(at => v.setAttribute(at, ''));
      v.poster = a.poster;
      v.dataset.src = a.video;
      v.setAttribute('aria-hidden', 'true');
      media.appendChild(v);
    } else {
      // <picture>: el teléfono baja la 4:5 y el computador la 16:9 (si la escena tiene ambas)
      const pic = document.createElement('picture');
      if (a.horiz_sm && a.foto_sm) {
        const s = document.createElement('source');
        s.media = '(max-width: 768px)';
        s.srcset = a.foto_sm;
        pic.appendChild(s);
      }
      const img = document.createElement('img');
      img.src = a.horiz_sm || a.foto_sm;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = `${titulo} en ${a.lugar}`;
      pic.appendChild(img);
      media.appendChild(pic);
    }

    // Mismo lenguaje que las fotos: título al pasar el mouse y una etiqueta fija
    const cap = document.createElement('span');
    cap.className = 'amb-cap';
    const t = document.createElement('span');
    t.className = 'amb-title';
    t.textContent = titulo;
    const l = document.createElement('span');
    l.className = 'amb-place';
    l.textContent = a.lugar;
    cap.append(t, l);
    const badge = document.createElement('span');
    badge.className = 'amb-badge';
    badge.textContent = 'Ambiente';

    card.append(media, cap, badge);
    card.addEventListener('click', () => {
      openViewer(a.code, vistasDe(p).findIndex(v => v.n === a.n));
    });
    return card;
  }

  // Repartidas parejo entre las fotos (la primera, en las primeras filas),
  // sin quedar pegadas a la foto que muestran
  const fotos = [...grid.querySelectorAll('.gallery-item')];
  const paso = fotos.length / (lista.length + 1);
  lista.forEach((a, k) => {
    const suya = el => !!el && codigosDe(a).includes(el.dataset.code);
    let i = Math.max(1, Math.round((k + 1) * paso));
    while (i < fotos.length && (suya(fotos[i]) || suya(fotos[i - 1]))) i++;
    grid.insertBefore(crearTarjeta(a), fotos[i] || null);
  });
  grid._justify?.();

  // Solo corren los videos que están a la vista (y ninguno con el visor abierto)
  const visibles = new Set();
  let enPausa = false;
  const play = v => {
    if (!v.getAttribute('src')) v.src = v.dataset.src;
    v.play().catch(() => {});
  };
  if (!REDUCED_MOTION && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { visibles.add(e.target); if (!enPausa) play(e.target); }
      else { visibles.delete(e.target); e.target.pause(); }
    }), { threshold: 0.5 });
    grid.querySelectorAll('.amb-card video').forEach(v => io.observe(v));
  }

  return {
    pausar() { enPausa = true; visibles.forEach(v => v.pause()); },
    reanudar() { enPausa = false; visibles.forEach(play); },
  };
})();

/* ── Visor unificado (foto grande → opciones) ── */
let pmFiltered = [...PHOTOS];
let pmIndex = 0;
let pmVistas = [];
let pmVista = 0;
let focoPrevio = null;
let cierreVisor = null;

/* Con el visor abierto, la página de atrás queda inerte: el Tab y los lectores
   de pantalla se quedan dentro del visor. */
function fondoInerte(si) {
  document.querySelectorAll('body > *').forEach(el => {
    if (el.id !== 'print-modal' && el.tagName !== 'SCRIPT') el.inert = si;
  });
}

function openViewer(code, vista) {
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.cat || 'all';
  pmFiltered = activeFilter === 'all' ? PHOTOS : PHOTOS.filter(p => photoCats(p).includes(activeFilter));
  pmIndex = pmFiltered.findIndex(p => p.code === code);
  if (pmIndex < 0) {
    // Abierta desde Ambientes con un filtro que no la incluye: navegar entre todas
    pmFiltered = PHOTOS;
    pmIndex = Math.max(0, PHOTOS.findIndex(p => p.code === code));
  }
  const modal = document.getElementById('print-modal');
  if (!modal.classList.contains('visible')) focoPrevio = document.activeElement;
  modal.classList.remove('options');
  setPmPhoto(pmFiltered[pmIndex], vista);
  clearTimeout(cierreVisor);
  modal.classList.add('open');
  modal.getBoundingClientRect();          // fuerza el estilo inicial para que el fundido corra
  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
  ambSeccion?.pausar();
  fondoInerte(true);
  modal.querySelector('.print-modal-inner').focus({ preventScroll: true });
}

function setPmPhoto(p, vista) {
  pmPhoto = p;
  renderSizeButtons(p);
  pmFrame = 'sin';
  pmColor = p.suggestedFrame || 'negro';
  renderPrintModal();
  pmVistas = vistasDe(p);
  renderThumbs();
  showVista(vista > 0 ? vista : 0);
}

/* Miniaturas del visor: foto, mockups y ambientes (solo si hay más de una vista) */
function renderThumbs() {
  const box = document.getElementById('pm-thumbs');
  if (!box) return;
  const hay = pmVistas.length > 1;
  box.innerHTML = '';
  box.hidden = !hay;
  box.closest('.pm-visual')?.classList.toggle('has-thumbs', hay);
  if (!hay) return;
  pmVistas.forEach((v, i) => {
    const b = document.createElement('button');
    b.className = 'pm-thumb' + (v.tipo === 'video' ? ' is-video' : '');
    b.setAttribute('aria-label', v.tipo === 'foto' ? 'Ver la foto'
      : `${v.tipo === 'video' ? 'Video' : 'Ambiente'}${v.lugar ? ': ' + v.lugar : ''}`);
    const img = document.createElement('img');
    img.alt = '';
    img.src = v.thumb;
    img.addEventListener('error', () => {
      const orig = v.tipo === 'foto' ? pmPhoto.src : v.src;
      if (v.tipo !== 'video' && !img.src.endsWith(encodeURI(orig))) img.src = orig;
    }, { once: true });
    b.appendChild(img);
    b.addEventListener('click', () => showVista(i));
    box.appendChild(b);
  });
}

function showVista(i) {
  pmVista = pmVistas[i] ? i : 0;
  const v = pmVistas[pmVista];
  const esFoto = v.tipo === 'foto';
  const amb = document.getElementById('pm-amb');
  const img = document.getElementById('pm-amb-img');
  const vid = document.getElementById('pm-amb-video');
  const cap = document.getElementById('pm-amb-cap');
  document.getElementById('pm-frame-wrap').hidden = !esFoto;
  amb.hidden = esFoto;
  amb.closest('.pm-visual').classList.toggle('is-amb', !esFoto);
  img.hidden = v.tipo !== 'img';
  vid.hidden = v.tipo !== 'video';
  if (v.tipo === 'img') {
    img.src = v.src;
    img.alt = `${pmPhoto.title} en un ambiente`;
  }
  if (v.tipo === 'video') {
    if (vid.getAttribute('src') !== v.src) {
      vid.poster = v.poster;
      vid.src = v.src;
    }
    vid.muted = true;
    vid.controls = REDUCED_MOTION;
    // iPhone en modo ahorro de batería bloquea la reproducción automática:
    // en ese caso se muestran los controles para darle play a mano.
    if (!REDUCED_MOTION) vid.play().catch(e => { if (e.name === 'NotAllowedError') vid.controls = true; });
  } else {
    vid.pause();
  }
  cap.hidden = esFoto;
  cap.textContent = esFoto ? '' : (v.lugar ? `${v.lugar} · ambiente recreado` : 'Ambiente de referencia');
  document.querySelectorAll('#pm-thumbs .pm-thumb').forEach((b, j) => {
    b.classList.toggle('active', j === pmVista);
    b.setAttribute('aria-pressed', j === pmVista);
  });
}

/* Los tamaños dependen de la proporción de la foto: una cuadrada no se
   ofrece en 20×30. Rearmamos los botones y dejamos el más chico activo. */
function renderSizeButtons(p) {
  const row = document.getElementById('pm-size-row');
  if (!row) return;
  const opciones = sizesFor(p);
  pmSize = opciones.length ? opciones[0].id : 's';
  row.innerHTML = '';
  opciones.forEach(s => {
    const b = document.createElement('button');
    b.className = 'pm-opt pm-size' + (s.id === pmSize ? ' active' : '');
    b.dataset.size = s.id;
    b.textContent = s.label;
    b.addEventListener('click', () => { pmSize = s.id; renderPrintModal(); });
    row.appendChild(b);
  });
}

document.getElementById('pm-prev')?.addEventListener('click', () => {
  pmIndex = (pmIndex - 1 + pmFiltered.length) % pmFiltered.length;
  setPmPhoto(pmFiltered[pmIndex]);
});
document.getElementById('pm-next')?.addEventListener('click', () => {
  pmIndex = (pmIndex + 1) % pmFiltered.length;
  setPmPhoto(pmFiltered[pmIndex]);
});
document.getElementById('pm-vb-options')?.addEventListener('click', () => {
  showVista(0); // el marco y el paspartú se simulan sobre la foto sola
  document.getElementById('print-modal').classList.add('options');
});
document.getElementById('pm-back')?.addEventListener('click', () => {
  document.getElementById('print-modal').classList.remove('options');
});


/* ── Print Modal ── */
let pmPhoto = null;
let pmSize = 's';
let pmFrame = 'sin';
let pmColor = 'negro';

const MARCO_COLORS = {
  negro:   { bg: '#141008', label: 'Negro' },
  natural: { bg: '#7a5228', label: 'Madera natural' },
  blanco:  { bg: '#f0ede8', label: 'Blanco' },
};

function openPrintModal(code) {
  openViewer(code);
  document.getElementById('print-modal').classList.add('options');
}

function closePrintModal() {
  const modal = document.getElementById('print-modal');
  modal.classList.remove('visible');
  clearTimeout(cierreVisor);
  cierreVisor = setTimeout(() => modal.classList.remove('open'), 180);
  document.body.style.overflow = '';
  document.getElementById('pm-amb-video')?.pause();
  ambSeccion?.reanudar();
  fondoInerte(false);
  // El foco vuelve a la foto o escena desde la que se abrió
  if (focoPrevio && document.contains(focoPrevio)) focoPrevio.focus({ preventScroll: true });
  focoPrevio = null;
}

function calcPrice() {
  const sz = SIZES.find(s => s.id === pmSize);
  let price = sz.prices[pmFrame];
  if (pmPhoto.limitedEdition) price = Math.round(price * LE_PREMIUM);
  return price;
}

function formatPrice(n) {
  return '$' + n.toLocaleString('es-CL') + ' CLP';
}

function renderPrintModal() {
  if (!pmPhoto) return;

  const imgEl = document.getElementById('pm-img');
  if (imgEl.getAttribute('src') !== pmPhoto.src) {
    imgEl.src = pmPhoto.src;
    if (!imgEl.complete) {                // si ya estaba en caché, sin fundido (flechas instantáneas)
      imgEl.classList.add('cargando');
      const listo = () => imgEl.classList.remove('cargando');
      imgEl.addEventListener('load', listo, { once: true });
      imgEl.addEventListener('error', listo, { once: true });
    }
  }
  imgEl.alt = pmPhoto.title;

  // Frame/mat CSS simulation (only on raw photo, not lifestyle mockups)
  const frameWrap = document.getElementById('pm-frame-wrap');
  const mat = document.getElementById('pm-mat');
  const pmVisual = frameWrap ? frameWrap.closest('.pm-visual') : null;
  const colorSection = document.getElementById('pm-color-section');
  if (frameWrap && mat) {
    const showFrame = pmFrame !== 'sin';
    frameWrap.className = 'pm-frame-wrap' +
      (showFrame ? ` show-${pmFrame} color-${pmColor}` : '');
    mat.className = 'pm-mat' + (showFrame && pmFrame === 'passe' ? ' show-passe' : '');
    if (pmVisual) pmVisual.classList.toggle('framed', showFrame);
  }
  // Show/hide color selector
  if (colorSection) {
    colorSection.style.display = pmFrame !== 'sin' ? '' : 'none';
    colorSection.querySelectorAll('.pm-color-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.color === pmColor);
      b.setAttribute('aria-pressed', b.dataset.color === pmColor);
    });
  }

  document.getElementById('pm-title').textContent = pmPhoto.title;
  document.getElementById('pm-loc').textContent = pmPhoto.location;
  const vbTitle = document.getElementById('pm-vb-title');
  const vbLoc = document.getElementById('pm-vb-loc');
  if (vbTitle) vbTitle.textContent = pmPhoto.title;
  if (vbLoc) vbLoc.textContent = pmPhoto.location;

  const leBadge = document.getElementById('pm-le-badge');
  if (leBadge) {
    leBadge.style.display = pmPhoto.limitedEdition ? '' : 'none';
    leBadge.textContent = `Edición Limitada · ${pmPhoto.edition || ''}`;
  }

  // sizes
  document.querySelectorAll('.pm-size').forEach(b => {
    b.classList.toggle('active', b.dataset.size === pmSize);
    b.setAttribute('aria-pressed', b.dataset.size === pmSize);
  });
  // frames
  document.querySelectorAll('.pm-frame').forEach(b => {
    b.classList.toggle('active', b.dataset.frame === pmFrame);
    b.setAttribute('aria-pressed', b.dataset.frame === pmFrame);
  });

  renderSizeNote();

  // En el visor, el número va grande en serif y "CLP" aparte, chico (ver .pm-currency)
  document.getElementById('pm-price').textContent = '$' + calcPrice().toLocaleString('es-CL');
  updateWaLink();
}

function renderSizeNote() {
  const noteEl = document.getElementById('pm-size-note');
  if (!noteEl) return;
  const sz = SIZES.find(s => s.id === pmSize);
  const m = sz && sz.label.match(/(\d+)\s*×\s*(\d+)/);
  if (!m) { noteEl.textContent = ''; return; }
  const w = parseInt(m[1], 10), h = parseInt(m[2], 10);
  // marco: +2 cm por lado · paspartú: +5 cm paspartú y +2 cm marco por lado
  const rows = [
    { id: 'sin',   label: 'Foto impresa',      dim: `${w} × ${h} cm` },
    { id: 'marco', label: 'Con marco',          dim: `${w + 4} × ${h + 4} cm` },
    { id: 'passe', label: 'Marco + paspartú',   dim: `${w + 14} × ${h + 14} cm` },
  ];
  noteEl.innerHTML = rows.map(r =>
    `<div class="pm-dim-row${pmFrame === r.id ? ' active' : ''}">` +
    `<span>${r.label}</span><strong>${r.dim}</strong></div>`
  ).join('');
}

document.getElementById('pm-close')?.addEventListener('click', closePrintModal);
document.getElementById('print-modal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('print-modal')) closePrintModal();
});
document.addEventListener('keydown', e => {
  const modal = document.getElementById('print-modal');
  if (!modal.classList.contains('visible')) return;   // cerrado o saliendo
  if (e.key === 'Escape') closePrintModal();
  if (!modal.classList.contains('options')) {
    if (e.key === 'ArrowLeft')  { pmIndex = (pmIndex - 1 + pmFiltered.length) % pmFiltered.length; setPmPhoto(pmFiltered[pmIndex]); }
    if (e.key === 'ArrowRight') { pmIndex = (pmIndex + 1) % pmFiltered.length; setPmPhoto(pmFiltered[pmIndex]); }
  }
});

document.querySelectorAll('.pm-frame').forEach(b => b.addEventListener('click', () => {
  pmFrame = b.dataset.frame; renderPrintModal();
}));
document.querySelectorAll('.pm-color-btn').forEach(b => b.addEventListener('click', () => {
  pmColor = b.dataset.color; renderPrintModal();
}));

/* Detalle del pedido, igual para el correo y para WhatsApp */
function orderDetails() {
  const sz = SIZES.find(s => s.id === pmSize);
  const frameMap = { sin:'Sin enmarcar', marco:'Con marco', passe:'Con paspartú' };
  const colorLabel = pmFrame !== 'sin' ? ` — ${MARCO_COLORS[pmColor].label}` : '';
  return `Fotografía: ${pmPhoto.title} (${pmPhoto.code})\n` +
    `Tamaño: ${sz.label}\n` +
    `Terminación: ${frameMap[pmFrame]}${colorLabel}\n` +
    (pmPhoto.limitedEdition ? `Edición: ${pmPhoto.edition}\n` : '') +
    `Precio estimado: ${formatPrice(calcPrice())}`;
}

/* El link de WhatsApp se rearma cada vez que cambia una opción del pedido */
function updateWaLink() {
  const wa = document.getElementById('pm-wa');
  if (!wa || !WHATSAPP || !pmPhoto) return;
  wa.href = waLink(`Hola German, me interesa esta impresión:\n\n${orderDetails()}\n\n¿Está disponible?`);
}

document.getElementById('pm-submit')?.addEventListener('click', () => {
  if (!pmPhoto) return;
  const subject = encodeURIComponent(`Solicitud de impresión — ${pmPhoto.title}`);
  const body = encodeURIComponent(
    `Hola German,\n\nMe gustaría solicitar una impresión:\n\n${orderDetails()}\n\n` +
    `Por favor confirmar disponibilidad y forma de pago.\n\nGracias.`
  );
  window.location.href = `mailto:germanicolas@gmail.com?subject=${subject}&body=${body}`;
});

/* ── Contact form ──
   Si el computador no tiene programa de correo, mailto: no abre nada. Por eso
   el formulario no se vacía y se ofrece copiar el mensaje o mandarlo por WhatsApp. */
document.getElementById('contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const asunto = data.asunto || 'Consulta';
  const texto = `Nombre: ${data.nombre}\nEmail: ${data.email}${data.telefono ? '\nTeléfono: ' + data.telefono : ''}\n\n${data.mensaje}`;
  window.location.href = `mailto:germanicolas@gmail.com?subject=${encodeURIComponent(`[German Weber Photo] ${asunto}`)}&body=${encodeURIComponent(texto)}`;

  const copiar = document.getElementById('form-copy');
  if (copiar) { copiar.dataset.texto = `Asunto: ${asunto}\n${texto}`; copiar.textContent = 'Copiar mensaje'; }
  const wa = document.getElementById('form-wa');
  if (wa && WHATSAPP) wa.href = waLink(`Hola German, te escribo desde tu web (${asunto}):\n\n${texto}`);
  document.getElementById('form-success').style.display = 'block';
});

document.getElementById('form-copy')?.addEventListener('click', async e => {
  const b = e.currentTarget;
  const texto = b.dataset.texto || '';
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    // Respaldo para navegadores sin acceso al portapapeles
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  b.textContent = 'Copiado';
});

/* ── Smooth scroll for nav links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

/* ── Disuasión de descarga de imágenes ──
   No es protección real (el navegador ya bajó la imagen para mostrarla),
   pero frena el clic derecho → "Guardar", el arrastre y el menú móvil. */
(function () {
  document.addEventListener('contextmenu', function (e) {
    if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO')) e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });
})();

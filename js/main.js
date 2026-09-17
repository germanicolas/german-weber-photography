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
    slide.dataset.bg = p.src;
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
    if (s && !s.style.backgroundImage) s.style.backgroundImage = `url('${s.dataset.bg}')`;
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
  setInterval(next, 5000);
})();

/* ── Miniaturas (generadas por tools/miniaturas.py) ── */
const THUMB_SIZES = { sm: 700, md: 1400 }; // lado mayor en px, igual que en el script
function thumbPath(src, size) {
  return src.replace(/^images\//, `images/thumbs/${size}/`);
}
function imgDims(src) {
  return (typeof IMG_DIMS !== 'undefined' && src && IMG_DIMS[src]) || null;
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
    if (typeof HORIZONTAL !== 'undefined' && HORIZONTAL.has(p.code)) {
      item.dataset.orientation = 'h';
    }

    const img = document.createElement('img');
    img.alt = p.title;
    img.loading = 'lazy';
    img.decoding = 'async';
    const full = p.mockup || p.src;
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

    const items = [...grid.querySelectorAll('.gallery-item')]
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
        r.img.sizes = w + 'px';
      });
      row = []; aspectSum = 0;
    };
    items.forEach(el => {
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
    btn.dataset.cat = cat.id;
    btn.textContent = cat.label;
    btn.addEventListener('click', () => {
      filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.gallery-item').forEach(el => {
        const cats = el.dataset.category.split(' ');
        el.dataset.visible = (cat.id === 'all' || cats.includes(cat.id)) ? 'true' : 'false';
      });
      justifyGallery();
    });
    filters.appendChild(btn);
  });
})();

/* ── Visor unificado (foto grande → opciones) ── */
let pmFiltered = [...PHOTOS];
let pmIndex = 0;

function openViewer(code) {
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.cat || 'all';
  pmFiltered = activeFilter === 'all' ? PHOTOS : PHOTOS.filter(p => photoCats(p).includes(activeFilter));
  pmIndex = pmFiltered.findIndex(p => p.code === code);
  if (pmIndex < 0) pmIndex = 0;
  const modal = document.getElementById('print-modal');
  modal.classList.remove('options');
  setPmPhoto(pmFiltered[pmIndex]);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function setPmPhoto(p) {
  pmPhoto = p;
  renderSizeButtons(p);
  pmFrame = 'sin';
  pmColor = p.suggestedFrame || 'negro';
  renderPrintModal();
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
  document.getElementById('print-modal').classList.remove('open');
  document.body.style.overflow = '';
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
  imgEl.src = pmPhoto.src;
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
  });
  // frames
  document.querySelectorAll('.pm-frame').forEach(b => {
    b.classList.toggle('active', b.dataset.frame === pmFrame);
  });

  renderSizeNote();

  document.getElementById('pm-price').textContent = formatPrice(calcPrice());
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
  if (!modal.classList.contains('open')) return;
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

/* ── Contact form ── */
document.getElementById('contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const subject = encodeURIComponent(`[German Weber Photo] ${data.asunto || 'Consulta'}`);
  const body = encodeURIComponent(
    `Nombre: ${data.nombre}\nEmail: ${data.email}${data.telefono ? '\nTeléfono: ' + data.telefono : ''}\n\n${data.mensaje}`
  );
  window.location.href = `mailto:germanicolas@gmail.com?subject=${subject}&body=${body}`;
  document.getElementById('form-success').style.display = 'block';
  form.reset();
});

/* ── Smooth scroll for nav links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Disuasión de descarga de imágenes ──
   No es protección real (el navegador ya bajó la imagen para mostrarla),
   pero frena el clic derecho → "Guardar", el arrastre y el menú móvil. */
(function () {
  document.addEventListener('contextmenu', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });
})();

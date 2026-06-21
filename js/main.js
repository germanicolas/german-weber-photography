/* ── Nav scroll + hero logo migration ── */
const nav = document.getElementById('nav');
const heroEl = document.getElementById('hero');
const heroLogo = document.querySelector('.hero-logo');
const heroSubtitle = document.querySelector('.hero-subtitle');
const heroScrollLink = document.querySelector('.hero-scroll');

let _fixedLogo = null;
let _initPos   = null;
let _smoothP   = 0;
let _targetP   = 0;

function _lerp(a, b, t) { return a + (b - a) * t; }
function _ease(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

function _initAnim() {
  if (!heroLogo || !heroEl) return;
  const rect = heroLogo.getBoundingClientRect();
  _initPos = { top: rect.top + window.scrollY, left: rect.left, w: rect.width, h: rect.height };

  _fixedLogo = document.createElement('img');
  _fixedLogo.src = heroLogo.src;
  _fixedLogo.alt = '';
  Object.assign(_fixedLogo.style, {
    position: 'fixed', zIndex: '200',
    filter: 'brightness(0) invert(1)',
    pointerEvents: 'none', display: 'block',
  });
  document.body.appendChild(_fixedLogo);
  heroLogo.style.opacity = '0';
  _rafLoop();
}

function _rafLoop() {
  // Smooth interpolation toward target — runs every frame
  _smoothP += (_targetP - _smoothP) * 0.09;

  if (_fixedLogo && _initPos) {
    const scrollY = window.scrollY;
    const p = _ease(_smoothP);

    const destH   = 28;
    const destW   = destH * (_initPos.w / _initPos.h);
    const destTop = (72 - destH) / 2;
    const destLeft = 40;

    _fixedLogo.style.top    = _lerp(_initPos.top - scrollY, destTop,  p) + 'px';
    _fixedLogo.style.left   = _lerp(_initPos.left,          destLeft, p) + 'px';
    _fixedLogo.style.width  = _lerp(_initPos.w,             destW,    p) + 'px';
    _fixedLogo.style.height = 'auto';

    const fadeOther = Math.max(1 - _smoothP * 2.5, 0);
    if (heroSubtitle)   heroSubtitle.style.opacity   = fadeOther;
    if (heroScrollLink) heroScrollLink.style.opacity = fadeOther;
  }

  requestAnimationFrame(_rafLoop);
}

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  nav.classList.toggle('scrolled', scrollY > 60);
  if (heroEl) {
    _targetP = Math.min(Math.max(scrollY / (heroEl.offsetHeight * 0.55), 0), 1);
  }
}, { passive: true });

window.addEventListener('load', _initAnim);

/* ── Mobile nav ── */
const toggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.nav-mobile');
toggle?.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}));

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
    slide.style.backgroundImage = `url('${p.src}')`;
    slidesEl.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dotsEl.appendChild(dot);
  });

  let cur = 0;
  function next() {
    const slides = slidesEl.querySelectorAll('.hero-slide');
    const dots   = dotsEl.querySelectorAll('.hero-dot');
    slides[cur].classList.remove('active');
    dots[cur].classList.remove('active');
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add('active');
    dots[cur].classList.add('active');
  }
  setInterval(next, 5000);
})();

/* ── Gallery ── */
(function () {
  const grid = document.getElementById('gallery-grid');
  const filters = document.getElementById('gallery-filters');
  if (!grid) return;

  function makeCard(p) {
    const item = document.createElement('div');
    item.className = 'gallery-item' + (p.limitedEdition ? ' le' : '');
    item.dataset.category = p.category;
    item.dataset.code = p.code;
    if (typeof HORIZONTAL !== 'undefined' && HORIZONTAL.has(p.code)) {
      item.dataset.orientation = 'h';
    }

    const img = document.createElement('img');
    img.alt = p.title;
    img.src = p.mockup || p.src;

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

    item.addEventListener('click', () => openLightbox(p.code));
    return item;
  }

  // Interleave photos by category for visual variety
  const catIds = CATEGORIES.filter(c => c.id !== 'all').map(c => c.id);
  const byCat  = {};
  catIds.forEach(id => { byCat[id] = PHOTOS.filter(p => p.category === id); });
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

  // En mobile: patrón variado V(1 o 2) + H ancho completo
  const isMobile = window.innerWidth < 768;
  if (isMobile && typeof HORIZONTAL !== 'undefined') {
    const verticals   = mixed.filter(p => !HORIZONTAL.has(p.code));
    const horizontals = mixed.filter(p =>  HORIZONTAL.has(p.code));
    const vGroups = [2, 1, 2, 2, 1, 2, 1, 2]; // cuántas V antes de cada H
    let vi = 0, hi = 0, gi = 0;
    while (vi < verticals.length || hi < horizontals.length) {
      const count = vGroups[gi++ % vGroups.length];
      const vCards = [];
      for (let i = 0; i < count && vi < verticals.length; i++) {
        vCards.push(makeCard(verticals[vi++]));
      }
      // Si es 1 sola, que ocupe todo el ancho
      if (vCards.length === 1) vCards[0].style.gridColumn = 'span 2';
      vCards.forEach(c => grid.appendChild(c));
      if (hi < horizontals.length) {
        const cardH = makeCard(horizontals[hi++]);
        cardH.style.gridColumn = 'span 2';
        grid.appendChild(cardH);
      }
    }
  } else {
    mixed.forEach(p => grid.appendChild(makeCard(p)));
  }

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
        el.dataset.visible = (cat.id === 'all' || el.dataset.category === cat.id) ? 'true' : 'false';
      });
    });
    filters.appendChild(btn);
  });
})();

/* ── Lightbox ── */
let lbFiltered = [...PHOTOS];
let lbIndex = 0;

function openLightbox(code) {
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.cat || 'all';
  lbFiltered = activeFilter === 'all' ? PHOTOS : PHOTOS.filter(p => p.category === activeFilter);
  lbIndex = lbFiltered.findIndex(p => p.code === code);
  if (lbIndex < 0) lbIndex = 0;
  renderLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function renderLightbox() {
  const p = lbFiltered[lbIndex];
  document.getElementById('lb-img').src = p.src;
  document.getElementById('lb-img').alt = p.title;
  document.getElementById('lb-title').textContent = p.title;
  document.getElementById('lb-loc').textContent = p.location;
  document.getElementById('lb-print').dataset.code = p.code;
}

document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
document.getElementById('lb-prev')?.addEventListener('click', () => {
  lbIndex = (lbIndex - 1 + lbFiltered.length) % lbFiltered.length;
  renderLightbox();
});
document.getElementById('lb-next')?.addEventListener('click', () => {
  lbIndex = (lbIndex + 1) % lbFiltered.length;
  renderLightbox();
});
document.getElementById('lightbox')?.addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
});
document.getElementById('lb-print')?.addEventListener('click', () => {
  const code = document.getElementById('lb-print').dataset.code;
  closeLightbox();
  openPrintModal(code);
});
document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbFiltered.length) % lbFiltered.length; renderLightbox(); }
  if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbFiltered.length; renderLightbox(); }
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
  pmPhoto = PHOTOS.find(p => p.code === code);
  if (!pmPhoto) return;
  pmSize = 's'; pmFrame = 'sin';
  pmColor = pmPhoto.suggestedFrame || 'negro';
  renderPrintModal();
  document.getElementById('print-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
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

  document.getElementById('pm-price').textContent = formatPrice(calcPrice());
}

document.getElementById('pm-close')?.addEventListener('click', closePrintModal);
document.getElementById('print-modal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('print-modal')) closePrintModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('print-modal').classList.contains('open')) closePrintModal();
});

document.querySelectorAll('.pm-size').forEach(b => b.addEventListener('click', () => {
  pmSize = b.dataset.size; renderPrintModal();
}));
document.querySelectorAll('.pm-frame').forEach(b => b.addEventListener('click', () => {
  pmFrame = b.dataset.frame; renderPrintModal();
}));
document.querySelectorAll('.pm-color-btn').forEach(b => b.addEventListener('click', () => {
  pmColor = b.dataset.color; renderPrintModal();
}));

document.getElementById('pm-submit')?.addEventListener('click', () => {
  if (!pmPhoto) return;
  const sz = SIZES.find(s => s.id === pmSize);
  const frameMap = { sin:'Sin enmarcar', marco:'Con marco', passe:'Con paspartú' };
  const colorLabel = pmFrame !== 'sin' ? ` — ${MARCO_COLORS[pmColor].label}` : '';
  const subject = encodeURIComponent(`Solicitud de impresión — ${pmPhoto.title}`);
  const body = encodeURIComponent(
    `Hola German,\n\nMe gustaría solicitar una impresión:\n\n` +
    `Fotografía: ${pmPhoto.title} (${pmPhoto.code})\n` +
    `Tamaño: ${sz.label}\n` +
    `Terminación: ${frameMap[pmFrame]}${colorLabel}\n` +
    (pmPhoto.limitedEdition ? `Edición: ${pmPhoto.edition}\n` : '') +
    `Precio estimado: ${formatPrice(calcPrice())}\n\n` +
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

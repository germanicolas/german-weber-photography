var PHOTOS = [
  { code:'AER-001', title:"Caburgua", location:"Chile", category:'aerial', src:'images/web/AER-001.jpg', mockup:"images/mockups/caburgua.jpg", mockup2:"images/mockups/caburgua 2.jpg", available:true, limitedEdition:false, suggestedFrame:'natural' },
  { code:'AER-002', title:"Salto El Palguin", location:"Chile", category:'aerial', src:'images/web/AER-002.jpg', available:true, limitedEdition:false },
  { code:'AER-003', title:"Mar Verde", location:"Chile", category:'aerial', src:'images/web/AER-003.jpg', available:true, limitedEdition:false },
  { code:'AER-005', title:"Río Loa", location:"Calama, Chile", category:'aerial', src:'images/web/AER-005.jpg', available:true, limitedEdition:false },
  { code:'AER-007', title:"Reñaca", location:"Reñaca, Chile", category:'aerial', src:'images/web/AER-007.jpg', available:true, limitedEdition:false },
  { code:'AER-008', title:"Puente & Niebla", location:"Chile", category:'aerial', src:'images/web/AER-008.jpg', available:true, limitedEdition:false },
  { code:'AER-009', title:"Peñuelas", location:"Valparaíso, Chile", category:'aerial', src:'images/web/AER-009.jpg', available:true, limitedEdition:false },
  { code:'AER-010', title:"Hipódromo", location:"Melbourne, Australia", category:'aerial', src:'images/web/AER-010.jpg', available:true, limitedEdition:false },
  { code:'AER-011', title:"UAI", location:"Santiago, Chile", category:'aerial', src:'images/web/AER-011.jpg', available:true, limitedEdition:false },
  { code:'AER-012', title:"Muelle Vergara", location:"Viña del Mar, Chile", category:'aerial', src:'images/web/AER-012.jpg', available:true, limitedEdition:false },
  { code:'AER-014', title:"Vta Vergara", location:"Viña del Mar, Chile", category:'aerial', src:'images/web/AER-014.jpg', available:true, limitedEdition:false },
  { code:'AER-015', title:"The Pass", location:"Byron Bay, Australia", category:'aerial', src:'images/web/AER-015.jpg', available:true, limitedEdition:false },
  { code:'AER-016', title:"The Pass II", location:"Byron Bay, Australia", category:'aerial', src:'images/web/AER-016.jpg', available:true, limitedEdition:false },
  { code:'AER-017', title:"Río Aconcagua", location:"Chile", category:'aerial', src:'images/web/AER-017.jpg', available:true, limitedEdition:false },
  { code:'AER-018', title:"Entre Nubes", location:"Pinilla, Chile", category:'aerial', src:'images/web/AER-018.jpg', available:true, limitedEdition:false },
  { code:'AER-019', title:"Pukaki", location:"Nueva Zelanda", category:'aerial', src:'images/web/AER-019.jpg', mockup:"images/mockups/pukaki.jpg", mockup2:"images/mockups/pukaki 2.jpg", available:true, limitedEdition:false, suggestedFrame:'negro' },
  { code:'AER-020', title:"Cordillera Nevada", location:"Calama, Chile", category:'aerial', src:'images/web/AER-020.jpg', available:true, limitedEdition:false },
  { code:'AER-021', title:"Rayo de Luz", location:"Calama, Chile", category:'aerial', src:'images/web/AER-021.jpg', available:true, limitedEdition:false },
  { code:'AER-022', title:"Desierto al Atardecer", location:"Calama, Chile", category:'aerial', src:'images/web/AER-022.jpg', available:true, limitedEdition:false },
  { code:'AER-024', title:"Relieve", location:"Calama, Chile", category:'aerial', src:'images/web/AER-024.jpg', available:true, limitedEdition:false },
  { code:'LND-001', title:"Laguna Pinilla I", location:"Pinilla, Chile", category:'landscape', src:'images/web/LND-001.jpg', available:true, limitedEdition:false },
  { code:'LND-002', title:"Laguna Pinilla II", location:"Pinilla, Chile", category:'landscape', src:'images/web/LND-002.jpg', mockup:"images/mockups/pinilla.jpg", mockup2:"images/mockups/pinilla 2.jpg", available:true, limitedEdition:false, suggestedFrame:'natural' },
  { code:'LND-003', title:"Laguna Pinilla III", location:"Pinilla, Chile", category:'landscape', src:'images/web/LND-003.jpg', available:true, limitedEdition:false },
  { code:'LND-005', title:"Conguillío", location:"Araucanía, Chile", category:'landscape', src:'images/web/LND-005.jpg', available:true, limitedEdition:false },
  { code:'LND-007', title:"Araucarias", location:"Araucanía, Chile", category:'landscape', src:'images/web/LND-007.jpg', available:true, limitedEdition:false },
  { code:'LND-008', title:"Aoraki", location:"Nueva Zelanda", category:'landscape', src:'images/web/LND-008.jpg', available:true, limitedEdition:false },
  { code:'LND-009', title:"Wanaka", location:"Nueva Zelanda", category:'landscape', src:'images/web/LND-009.jpg', available:true, limitedEdition:true, edition:"1/10" },
  { code:'LND-010', title:"Wanaka II", location:"Nueva Zelanda", category:'landscape', src:'images/web/LND-010.jpg', available:true, limitedEdition:false },
  { code:'LND-011', title:"Milford Sound", location:"Nueva Zelanda", category:'landscape', src:'images/web/LND-011.jpg', available:true, limitedEdition:false },
  { code:'LND-012', title:"Río Futaleufú", location:"Patagonia, Chile", category:'landscape', src:'images/web/LND-012.jpg', mockup:"images/mockups/futa.jpg", mockup2:"images/mockups/futa 2.jpg", available:true, limitedEdition:false, suggestedFrame:'natural' },
  { code:'LND-013', title:"Valle California", location:"Chile", category:'landscape', src:'images/web/LND-013.jpg', available:true, limitedEdition:false },
  { code:'LND-014', title:"Montserrat", location:"España", category:'landscape', categories:['landscape','bw'], src:'images/web/LND-014.jpg', available:true, limitedEdition:false },
  { code:'LND-015', title:"Calma", location:"Chile", category:'landscape', src:'images/web/LND-015.jpg', available:true, limitedEdition:false },
  { code:'LND-016', title:"Porto", location:"Portugal", category:'landscape', src:'images/web/LND-016.jpg', available:true, limitedEdition:false },
  { code:'LND-017', title:"Montmartre", location:"París, Francia", category:'landscape', src:'images/web/LND-017.jpg', available:true, limitedEdition:false },
  { code:'LND-018', title:"Seven Sisters I", location:"Sussex, Reino Unido", category:'landscape', categories:['landscape','bw'], src:'images/web/LND-018.jpg', mockup:"images/mockups/7 sisters .jpg", available:true, limitedEdition:false, suggestedFrame:'blanco' },
  { code:'LND-019', title:"Seven Sisters II", location:"Sussex, Reino Unido", category:'landscape', src:'images/web/LND-019.jpg', available:true, limitedEdition:false, suggestedFrame:'blanco' },
  { code:'LND-020', title:"Seven Sisters III", location:"Sussex, Reino Unido", category:'landscape', src:'images/web/LND-020.jpg', mockup:"images/mockups/sisters.jpg", mockup2:"images/mockups/sisters 2.jpg", available:true, limitedEdition:false },
  { code:'SEA-001', title:"Olas", location:"Concón, Chile", category:'seascape', src:'images/web/SEA-001.jpg', mockup:"images/mockups/waves.jpg", mockup2:"images/mockups/waves 2.jpg", available:true, limitedEdition:true, edition:"2/10", suggestedFrame:'negro' },
  { code:'SEA-002', title:"Rocas & Olas", location:"Concón, Chile", category:'seascape', src:'images/web/SEA-002.jpg', available:true, limitedEdition:true, edition:"1/10" },
  { code:'SEA-003', title:"La Piedra", location:"Concón, Chile", category:'seascape', src:'images/web/SEA-003.jpg', available:true, limitedEdition:true, edition:"3/10" },
  { code:'SEA-004', title:"St Kilda", location:"Melbourne, Australia", category:'seascape', src:'images/web/SEA-004.jpg', available:true, limitedEdition:false },
  { code:'ARC-001', title:"Grid", location:"Londres, Reino Unido", category:'architecture', src:'images/web/ARC-001.jpg', available:true, limitedEdition:false },
  { code:'ARC-002', title:"St Paul's", location:"Londres, Reino Unido", category:'architecture', src:'images/web/ARC-002.jpg', available:true, limitedEdition:false },
  { code:'ARC-004', title:"Westminster", location:"Londres, Reino Unido", category:'architecture', categories:['architecture','bw'], src:'images/web/ARC-004.jpg', available:true, limitedEdition:false },
  { code:'ARC-005', title:"London Eye", location:"Londres, Reino Unido", category:'architecture', src:'images/web/ARC-005.jpg', available:true, limitedEdition:false },
  { code:'ARC-006', title:"King's College", location:"Cambridge, Reino Unido", category:'architecture', src:'images/web/ARC-006.jpg', mockup:"images/mockups/cambridge.jpg", mockup2:"images/mockups/cambridge 2.jpg", available:true, limitedEdition:false, suggestedFrame:'blanco' },
  { code:'ARC-007', title:"Natural History", location:"Londres, Reino Unido", category:'architecture', src:'images/web/ARC-007.jpg', available:true, limitedEdition:false },
  { code:'ARC-008', title:"Mayfair", location:"Londres, Reino Unido", category:'architecture', src:'images/web/ARC-008.jpg', available:true, limitedEdition:false },
  { code:'ARC-009', title:"RMIT I", location:"Melbourne, Australia", category:'architecture', src:'images/web/ARC-009.jpg', available:true, limitedEdition:false },
  { code:'ARC-010', title:"RMIT II", location:"Melbourne, Australia", category:'architecture', src:'images/web/ARC-010.jpg', available:true, limitedEdition:false },
  { code:'ARC-011', title:"Montmartre II", location:"París, Francia", category:'architecture', src:'images/web/ARC-011.jpg', available:true, limitedEdition:false },
  { code:'ARC-012', title:"Rose", location:"París, Francia", category:'architecture', src:'images/web/ARC-012.jpg', available:true, limitedEdition:false },
  { code:'ARC-013', title:"El Panteón", location:"Roma, Italia", category:'architecture', categories:['architecture','bw'], src:'images/web/ARC-013.jpg', available:true, limitedEdition:true, edition:"2/10" },
  { code:'ARC-014', title:"Coliseo", location:"Roma, Italia", category:'architecture', src:'images/web/ARC-014.jpg', available:true, limitedEdition:false },
  { code:'ARC-015', title:"Duoro", location:"Porto, Portugal", category:'architecture', src:'images/web/ARC-015.jpg', available:true, limitedEdition:false },
  { code:'ARC-017', title:"Melbourne Amanecer", location:"Melbourne, Australia", category:'architecture', src:'images/web/ARC-017.jpg', available:true, limitedEdition:true, edition:"1/10" },
  { code:'WLD-001', title:"Chincol", location:"Chile", category:'wildlife', src:'images/web/WLD-001.jpg', available:true, limitedEdition:false },
  { code:'WLD-004', title:"Pelícanos I", location:"Concón, Chile", category:'wildlife', src:'images/web/WLD-004.jpg', available:true, limitedEdition:false },
  { code:'WLD-005', title:"Pelícanos II", location:"Concón, Chile", category:'wildlife', src:'images/web/WLD-005.jpg', available:true, limitedEdition:false },
  { code:'WLD-006', title:"Pelícanos III", location:"Chile", category:'wildlife', src:'images/web/WLD-006.jpg', available:true, limitedEdition:false },
  { code:'WLD-007', title:"Pelícano IV", location:"Chile", category:'wildlife', src:'images/web/WLD-007.jpg', available:true, limitedEdition:false },
  { code:'WLD-008', title:"Pelícano V", location:"Chile", category:'wildlife', src:'images/web/WLD-008.jpg', available:true, limitedEdition:false },
  { code:'WLD-010', title:"Caballos", location:"Chile", category:'wildlife', categories:['wildlife','bw'], src:'images/web/WLD-010.jpg', mockup:"images/mockups/horses.jpg", mockup2:"images/mockups/caballos gigantes pared.jpg", available:true, limitedEdition:true, edition:"1/10", suggestedFrame:'natural' },
  { code:'WLD-014', title:"Siete Colores I", location:"Valdivia, Chile", category:'wildlife', src:'images/web/WLD-014.jpg', available:true, limitedEdition:false },
  { code:'WLD-015', title:"Siete Colores II", location:"Valdivia, Chile", category:'wildlife', src:'images/web/WLD-015.jpg', available:true, limitedEdition:false },
  { code:'WLD-017', title:"Siete Colores III", location:"Valdivia, Chile", category:'wildlife', src:'images/web/WLD-017.jpg', available:true, limitedEdition:false },
  { code:'WLD-018', title:"Guanaco", location:"Torres del Paine, Chile", category:'wildlife', src:'images/web/WLD-018.jpg', available:true, limitedEdition:false },
  { code:'WLD-019', title:"Guanacos", location:"Torres del Paine, Chile", category:'wildlife', src:'images/web/WLD-019.jpg', available:true, limitedEdition:false },
  { code:'STR-001', title:"Wine Bar", location:"Londres, Reino Unido", category:'street', categories:['street','bw'], src:'images/web/STR-001.jpg', available:true, limitedEdition:false },
  { code:'STR-002', title:"London Street", location:"Londres, Reino Unido", category:'street', src:'images/web/STR-002.jpg', mockup:"images/mockups/walking past.jpg", mockup2:"images/mockups/walking past 2.jpg", available:true, limitedEdition:false, suggestedFrame:'negro' },
  { code:'STR-003', title:"Wimbledon I", location:"Londres, Reino Unido", category:'street', src:'images/web/STR-003.jpg', available:true, limitedEdition:false },
  { code:'STR-004', title:"Wimbledon II", location:"Londres, Reino Unido", category:'street', src:'images/web/STR-004.jpg', available:true, limitedEdition:false },
  { code:'AST-002', title:"Eclipse Solar", location:"Chile", category:'astro', src:'images/web/AST-002.jpg', available:true, limitedEdition:true, edition:"2/10" },
  { code:'ARC-018', title:"Sunset Oporto", location:"Oporto, Portugal", category:'architecture', src:'images/web/ARC-018.jpg', available:true, limitedEdition:false },
  { code:'ARC-020', title:"Coliseo", location:"Roma, Italia", category:'architecture', src:'images/web/ARC-020.jpg', available:true, limitedEdition:false },
  { code:'ARC-021', title:"Il Duomo", location:"Florencia, Italia", category:'architecture', categories:['architecture','bw'], src:'images/web/ARC-021.jpg', available:true, limitedEdition:false },
  { code:'ARC-022', title:"David", location:"Florencia, Italia", category:'architecture', categories:['architecture','bw'], src:'images/web/ARC-022.jpg', available:true, limitedEdition:false },
  { code:'ARC-025', title:"San Pedro", location:"Ciudad del Vaticano", category:'architecture', src:'images/web/ARC-025.jpg', available:true, limitedEdition:false },
  { code:'ARC-027', title:"Panteón", location:"Roma, Italia", category:'architecture', categories:['architecture','bw'], src:'images/web/ARC-027.jpg', available:true, limitedEdition:false },
  { code:'SEA-006', title:"Marea baja", location:"Chile", category:'seascape', categories:['seascape','bw'], ratio:'1:1', src:'images/web/SEA-006.jpg', available:true, limitedEdition:false },
  { code:'SEA-007', title:"Rock", location:"Chile", category:'seascape', categories:['seascape','bw'], ratio:'1:1', src:'images/web/SEA-007.jpg', available:true, limitedEdition:false },
  { code:'SEA-008', title:"Lonely", location:"Chile", category:'seascape', categories:['seascape','bw'], ratio:'1:1', src:'images/web/SEA-008.jpg', available:true, limitedEdition:false },
  { code:'STR-006', title:"Generalitat", location:"Barcelona, España", category:'street', categories:['street','bw'], src:'images/web/STR-006.jpg', available:true, limitedEdition:false },
  { code:'LND-021', title:"Pastos", location:"Chile", category:'landscape', src:'images/web/LND-021.jpg', available:true, limitedEdition:false },
  { code:'LND-022', title:"Pastos II", location:"Chile", category:'landscape', src:'images/web/LND-022.jpg', available:true, limitedEdition:false },
  { code:'LND-023', title:"Torres al Alba", location:"Torres del Paine, Chile", category:'landscape', src:'images/web/LND-023.jpg', available:true, limitedEdition:false },
  { code:'LND-024', title:"Torres del Paine", location:"Torres del Paine, Chile", category:'landscape', src:'images/web/LND-024.jpg', available:true, limitedEdition:false },
  { code:'LND-025', title:"Reflejo", location:"Torres del Paine, Chile", category:'landscape', src:'images/web/LND-025.jpg', available:true, limitedEdition:false },
  { code:'LND-026', title:"Piedras", location:"Torres del Paine, Chile", category:'landscape', src:'images/web/LND-026.jpg', available:true, limitedEdition:false },
  { code:'LND-027', title:"Bosque en Niebla", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-027.jpg', available:true, limitedEdition:false },
  { code:'LND-028', title:"Niebla sobre el Humedal I", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-028.jpg', available:true, limitedEdition:false },
  { code:'LND-029', title:"Niebla sobre el Humedal II", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-029.jpg', available:true, limitedEdition:false },
  { code:'LND-031', title:"Lluvia", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-031.jpg', available:true, limitedEdition:false },
  { code:'LND-032', title:"Juncos en Movimiento", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-032.jpg', available:true, limitedEdition:false },
  { code:'LND-033', title:"Orilla", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-033.jpg', available:true, limitedEdition:false },
  { code:'LND-036', title:"Corriente", location:"Valdivia, Chile", category:'landscape', categories:['landscape','bw'], src:'images/web/LND-036.jpg', available:true, limitedEdition:false },
  { code:'LND-039', title:"Flor de Ciruelo", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-039.jpg', available:true, limitedEdition:false },
  { code:'LND-040', title:"Botón de Camelia", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-040.jpg', available:true, limitedEdition:false },
  { code:'LND-041', title:"Camelia", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-041.jpg', available:true, limitedEdition:false },
  { code:'LND-042', title:"Ciprés", location:"Valdivia, Chile", category:'landscape', src:'images/web/LND-042.jpg', available:true, limitedEdition:false }
];

var SIZES = [
  { id:'s', ratio:'2:3', label:"20 × 30 cm", prices:{ sin:45000, passe:105000, marco:85000 } },
  { id:'m', ratio:'2:3', label:"40 × 60 cm", prices:{ sin:85000, passe:195000, marco:175000 } },
  { id:'l', ratio:'2:3', label:"60 × 90 cm", prices:{ sin:130000, passe:345000, marco:285000 } },
  // Formato cuadrado. PRECIOS PROVISORIOS: estimados por área (obra) y por
  // metro lineal de moldura (enmarcado). Confirmar con Eseâ y con Artprice.
  { id:'sq-s', ratio:'1:1', label:"30 × 30 cm", prices:{ sin:50000,  passe:115000, marco:100000 } },
  { id:'sq-m', ratio:'1:1', label:"45 × 45 cm", prices:{ sin:80000,  passe:180000, marco:160000 } },
  { id:'sq-l', ratio:'1:1', label:"60 × 60 cm", prices:{ sin:105000, passe:240000, marco:220000 } }
];

var LE_PREMIUM = 1.3;

var HERO_PHOTOS = ["LND-001","SEA-003","WLD-004","AER-002"];

var HERO_PHOTOS_MOBILE = ["AER-024","AER-016","LND-013","ARC-015"];

/* Categorías de una foto. `categories` (lista) manda; si no está, se usa
   `category` sola. Así una foto puede vivir en su categoría nativa y en B&N. */
function photoCats(p) {
  return (p && p.categories && p.categories.length) ? p.categories : [p.category];
}

/* Tamaños disponibles para una foto: los cuadrados solo para fotos 1:1,
   los 2:3 para el resto. */
function sizesFor(p) {
  var r = (p && p.ratio) || '2:3';
  return SIZES.filter(function (s) { return (s.ratio || '2:3') === r; });
}

var CATEGORIES = [
  { id:'all', label:'Todos' },
  { id:'aerial', label:'Aerial' },
  { id:'landscape', label:'Paisaje' },
  { id:'seascape', label:'Mar' },
  { id:'architecture', label:'Arquitectura' },
  { id:'wildlife', label:'Fauna' },
  { id:'street', label:'Street' },
  { id:'astro', label:'Astro' },
  { id:'bw', label:'B\u0026N' },
];

var TEXTS = {
  "tiendaDesc": "Cada imagen está disponible como impresión fine art de alta calidad, producida en conjunto con una galería especializada en Concón, Chile. Disponible en múltiples tamaños, con o sin marco o paspartú.",
  "aboutP1": "Soy <strong>Germán Weber</strong>, fotógrafo en <strong>Concón, Chile</strong>. Fotografío paisajes patagónicos, ecosistemas costeros y ciudades que he recorrido en Sudamérica, Europa y Oceanía.",
  "aboutP2": "Con el tiempo me he dado cuenta de que la fotografía es algo muy personal, tanto para el que la toma como para el que la mira. No hay una forma correcta de ver una imagen, ni una forma correcta de tomarla. Yo fotografío lo que a mí me interesa, como a mí me nace hacerlo. Si te gusta lo que ves, ahí está el punto de todo esto.",
  "aboutP3": "Hoy reparto mi tiempo entre encargos, proyectos personales y trabajo audiovisual en conservación de ríos en Chile.",
  "contactDesc": "Para consultas sobre impresiones, pedidos personalizados o cualquier otra pregunta, escríbeme directamente. Respondo en menos de 48 horas."
};

var DATA_VERSION = 16;

var HORIZONTAL = new Set(["AER-002","AER-005","AER-007","AER-015","AER-017","AER-018","AER-020","AER-022","ARC-004","ARC-013","ARC-014","ARC-017","ARC-020","ARC-021","ARC-027","LND-001","LND-002","LND-003","LND-008","LND-009","LND-010","LND-011","LND-014","LND-016","LND-017","LND-018","LND-020","LND-023","LND-029","LND-031","LND-032","LND-033","LND-036","SEA-003","SEA-004","STR-006","WLD-004","WLD-006","WLD-007","WLD-010","WLD-015","WLD-017","WLD-018"]);

// Admin overrides from localStorage.
// El cache solo se aplica cuando su versión coincide con la del data.js publicado
// (sirve para previsualizar cambios del admin antes de publicar). Si el data.js
// publicado es más nuevo (otra versión), el cache está obsoleto → se descarta y
// manda el archivo. Así nunca queda una copia vieja tapando fotos/precios nuevos.
(function() {
  try {
    var saved = localStorage.getItem('gw-admin-data');
    if (!saved) return;
    var d = JSON.parse(saved);
    if (d.version !== DATA_VERSION) {
      localStorage.removeItem('gw-admin-data');
      return;
    }
    if (d.photos)     { PHOTOS.length = 0;     d.photos.forEach(function(p){ PHOTOS.push(p); }); }
    if (d.sizes)      { SIZES.length = 0;       d.sizes.forEach(function(s){ SIZES.push(s); }); }
    if (d.heroPhotos) { HERO_PHOTOS.length = 0; d.heroPhotos.forEach(function(c){ HERO_PHOTOS.push(c); }); }
    if (d.heroPhotosMobile) { HERO_PHOTOS_MOBILE.length = 0; d.heroPhotosMobile.forEach(function(c){ HERO_PHOTOS_MOBILE.push(c); }); }
    if (d.lePremium !== undefined) LE_PREMIUM = d.lePremium;
    if (d.texts) { Object.assign(TEXTS, d.texts); }
  } catch(e) {}
})();

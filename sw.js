/* Emily Pizza · service worker: abre rápido y funciona aunque la señal esté mala.
   Sube el número de versión cuando cambies archivos para que los celulares se actualicen. */
const VERSION = "emily-v3";
const CORE = ["/", "/menu.js", "/app.js", "/stock.js", "/firebase-config.js", "/manifest.webmanifest",
  "/fonts/fraunces.woff2", "/fonts/albert-sans.woff2", "/img/logo.webp", "/img/logo-dark.webp", "/img/pizarra.webp", "/img/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // Firebase, fuentes y WhatsApp van directo
  if (url.pathname.startsWith("/admin")) return;                     // el panel siempre en vivo
  if (req.mode === "navigate") {                                      // páginas: primero internet, si no hay, la copia
    e.respondWith(fetch(req).then(r => {
      if (r.ok && !r.redirected) { const c = r.clone(); caches.open(VERSION).then(x => x.put(url.pathname === "/" ? "/" : req, c)); }
      return r;
    }).catch(() => caches.match(url.pathname === "/" ? "/" : req).then(hit => hit || caches.match("/"))));
    return;
  }
  if (url.pathname.startsWith("/img/")) {                             // imágenes: copia guardada primero
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r; })));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {                       // js y demás: copia y se actualiza por detrás
    const net = fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r; }).catch(() => hit);
    return hit || net;
  }));
});

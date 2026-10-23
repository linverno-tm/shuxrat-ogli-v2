// PWA: sayt telefon ekraniga o'rnatiladi; internet uzilsa — ochilgan sahifalar keshdan, bo'lmasa «Internet yo'q» sahifasi.
// Sahifalar: avval tarmoq (doim yangi), keyin kesh. Rasm/shrift/uslub: keshdan darhol, fonda yangilanadi.
// Admin, /shuxrat-ogli-v2/api va videolar (Range so'rovlar) keshlanmaydi. Yo'llar doiraga (scope) nisbatan — GitHub nusxasida ham ishlaydi.
const VER = 'v4';
const DOIRA = self.registration.scope;                 // masalan https://…/ yoki https://…/shuxrat-ogli-v2/
const SAHIFA = 'sahifa-' + VER, AKTIV = 'aktiv-' + VER;
const OLDINDAN = ['', 'oflayn', 'uslub.css', 'asosiy.js', 'harakat.css', 'logo/belgi.svg', 'favicon.svg'].map((y) => DOIRA + y);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(AKTIV).then((c) => c.addAll(OLDINDAN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== SAHIFA && x !== AKTIV).map((x) => caches.delete(x))))
    .then(() => self.clients.claim()));
});

const tegma = (u) => /\/(admin|api)(\/|$)/.test(u.pathname) || /\.(mp4|webm|pdf)$/i.test(u.pathname);
const aktivmi = (u) => /\.(css|js|woff2?|webp|png|jpe?g|svg|ico|webmanifest)$/i.test(u.pathname);

self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || !u.href.startsWith(DOIRA) || tegma(u) || r.headers.has('range')) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((javob) => {
      if (javob.ok) { const n = javob.clone(); caches.open(SAHIFA).then((c) => c.put(r, n)); }
      return javob;
    }).catch(() => caches.match(r).then((k) => k || caches.match(DOIRA + 'oflayn'))));
    return;
  }
  if (aktivmi(u)) {
    e.respondWith(caches.open(AKTIV).then((c) => c.match(r).then((k) => {
      const yangi = fetch(r).then((javob) => { if (javob.ok) c.put(r, javob.clone()); return javob; }).catch(() => k);
      return k || yangi;
    })));
  }
});

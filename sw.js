// Offline cache: the game itself works without internet once it has been opened.
const CACHE = 'zi-v52';
const SHELL = ['./', 'index.html', 'config.js', 'three.min.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/logo.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // never cache sign-in and database traffic
  if (/googleapis\.com$|firebaseapp\.com$|google\.com$/.test(url.hostname) && !url.hostname.startsWith('fonts.')) return;
  if (url.origin === location.origin) {
    // app files: network first so updates arrive, cache as fallback for offline
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
  } else if (url.hostname.startsWith('fonts.') || url.hostname === 'www.gstatic.com') {
    // fonts and Firebase scripts: cache first
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; })));
  }
});

// Service worker: a app abre mesmo sem internet. Os pedidos ao Google nunca passam pela cache.
const CACHE = 'savealotl-v21';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (/googleapis\.com$|accounts\.google\.com$/.test(url.hostname)) return;
  // Página e configuração: primeiro a rede (para receber atualizações), senão a cópia guardada.
  if (req.mode === 'navigate' || url.pathname.endsWith('/config.js')) {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  // Resto (ícones, letra): cópia guardada primeiro, e atualiza em segundo plano.
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});

// ---------- Lembretes: se passarem mais de 3 dias sem abrir a app ----------
// Usa a "sincronização periódica em segundo plano" do Chrome (Android, app instalada). Não precisa de servidor.
const REM_DB = 'sav-rem', DAY = 864e5;
function remOpen() { return new Promise((res, rej) => { const r = indexedDB.open(REM_DB, 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function remGet(k) { const db = await remOpen(); return new Promise((res, rej) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => { db.close(); res(q.result); }; q.onerror = () => rej(q.error); }); }
async function remSet(k, v) { const db = await remOpen(); return new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => { db.close(); res(); }; tx.onerror = () => rej(tx.error); }); }
async function checkReminder() {
  try {
    if (!(await remGet('enabled'))) return;
    const now = Date.now(), last = (await remGet('lastOpen')) || 0, lastRem = (await remGet('lastRem')) || 0, n = (await remGet('count')) || 0;
    if (!last || now - last < 3 * DAY) return;          // ainda não passaram 3 dias
    if (n >= 3) return;                                  // no máximo 3 lembretes seguidos
    if (now - lastRem < 3 * DAY) return;                 // um de 3 em 3 dias
    const quiet = await remGet('quiet'), h = new Date().getHours();
    if (quiet !== false && (h < 8 || h >= 22)) return;   // sem avisos de noite
    await self.registration.showNotification('Savealotl 🦎', {
      body: 'Não te esqueças de registar as tuas despesas! Os axolotls estão com saudades.',
      icon: './icon-192.png', badge: './icon-192.png', tag: 'lembrete', data: { url: './' }
    });
    await remSet('lastRem', now); await remSet('count', n + 1);
  } catch (e) { /* silencioso */ }
}
self.addEventListener('periodicsync', e => { if (e.tag === 'lembrete') e.waitUntil(checkReminder()); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const cl = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cl) { if ('focus' in c) return c.focus(); }
    return clients.openWindow('./');
  })());
});

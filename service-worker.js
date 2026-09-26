/* Tá em dúvida? Procure aqui. — service worker
   Sempre busca a versão mais nova na internet.
   Sem internet, abre a última cópia guardada no celular.
   NÃO precisa mudar nada neste arquivo quando atualizar o app. */
const CACHE = 'ta-em-duvida';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Só cuida dos arquivos do próprio app. Mapa, buscas e Mapbox passam direto.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(res => {
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true })
          .then(r => r || caches.match('./index.html'))
      )
  );
});

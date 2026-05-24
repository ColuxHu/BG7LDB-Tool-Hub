// NOTE: bump this when changing caching strategy or core assets.
const CACHE_NAME = 'table-tennis-doubles-v37';
const ASSETS = [
  './',
  './index.html',
  './src/styles.css',
  './src/app.js',
  './manifest.json',
  './sw.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

const CORE_ASSET_PATHS = new Set([
  '',
  '/',
  'index.html',
  'src/styles.css',
  'src/app.js',
  'manifest.json'
]);

function pathInScope(url) {
  const scopePath = new URL(self.registration.scope).pathname;
  const relative = url.pathname.startsWith(scopePath)
    ? url.pathname.slice(scopePath.length)
    : url.pathname.replace(/^\//, '');
  return relative || '';
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigate = request.mode === 'navigate';
  const isCoreAsset = isSameOrigin && (isNavigate || CORE_ASSET_PATHS.has(pathInScope(url)));

  // 对核心资源使用 network-first，避免 PWA 长期卡在旧版本。
  if (isCoreAsset) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 其他资源保持 cache-first。
  event.respondWith(caches.match(request).then(response => response || fetch(request)));
});

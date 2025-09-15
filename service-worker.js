// Versión dinámica basada en timestamp o desarrollo
const VERSION = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1' 
  ? `dev-${Date.now()}` 
  : 'pos-pizzeria-v1.0.0';

const CACHE_NAME = `pos-pizzeria-${VERSION}`;
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

const CORE_ASSETS = [
  './',
  './Index.html',
  './style.css',
  './manifest.json'
];

// Recursos que se cachean de manera diferente en desarrollo vs producción
const DYNAMIC_ASSETS = [
  './src/ui/main-react.tsx'
];

// Install
self.addEventListener('install', event => {
  console.log(`[SW] Installing version ${VERSION}, isDev: ${isDev}`);
  
  if (isDev) {
    // En desarrollo, no pre-cachear recursos dinámicos
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
    );
  } else {
    // En producción, cachear todo
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll([...CORE_ASSETS, ...DYNAMIC_ASSETS]))
    );
  }
  
  self.skipWaiting();
});

// Activate (cleanup)
self.addEventListener('activate', event => {
  console.log(`[SW] Activating version ${VERSION}`);
  event.waitUntil(
    caches.keys().then(keys => {
      const deletePromises = keys
        .filter(key => key.startsWith('pos-pizzeria-') && key !== CACHE_NAME)
        .map(key => {
          console.log(`[SW] Deleting old cache: ${key}`);
          return caches.delete(key);
        });
      return Promise.all(deletePromises);
    })
  );
  self.clients.claim();
});

// Fetch Strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests GET del mismo origen
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // En desarrollo, diferentes estrategias para diferentes tipos de archivo
  if (isDev) {
    event.respondWith(handleDevFetch(request));
  } else {
    event.respondWith(handleProdFetch(request));
  }
});

// Estrategia para desarrollo: Network First con cache limitado
async function handleDevFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Para archivos JS/CSS/HTML, siempre intentar network first
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html')) {
      console.log(`[SW] Dev Network First: ${url.pathname}`);
      const networkResponse = await fetch(request);
      
      // Opcionalmente cachear con TTL corto
      if (networkResponse.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        const responseClone = networkResponse.clone();
        // Agregar header de expiración corta para dev
        cache.put(request, responseClone);
      }
      
      return networkResponse;
    }
    
    // Para otros recursos (imágenes, etc.), usar cache first
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.log(`[SW] Dev fetch failed for ${url.pathname}, trying cache`);
    const cacheResponse = await caches.match(request);
    return cacheResponse || caches.match('./Index.html');
  }
}

// Estrategia para producción: Cache First con fallback a network
async function handleProdFetch(request) {
  try {
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.log(`[SW] Prod fetch failed, trying cache fallback`);
    return caches.match('./Index.html');
  }
}
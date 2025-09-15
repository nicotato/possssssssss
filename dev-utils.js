/**
 * Utilidades para desarrollo - Script independiente para debug de caché
 */

// Función para limpiar completamente el caché del navegador
async function devClearAllCache() {
  console.log('🧹 Clearing all cache...');
  
  // 1. Service Worker Cache
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log(`✓ Cleared ${cacheNames.length} service worker caches:`, cacheNames);
  }
  
  // 2. Local Storage
  const localStorageKeys = Object.keys(localStorage);
  localStorage.clear();
  console.log(`✓ Cleared ${localStorageKeys.length} localStorage items`);
  
  // 3. Session Storage
  const sessionStorageKeys = Object.keys(sessionStorage);
  sessionStorage.clear();
  console.log(`✓ Cleared ${sessionStorageKeys.length} sessionStorage items`);
  
  // 4. IndexedDB (RxDB)
  if ('indexedDB' in window) {
    try {
      // Lista bases de datos conocidas del proyecto
      const dbNames = ['pos-pizzeria-db', 'pos-pizzeria', 'rxdb-dexie'];
      for (const dbName of dbNames) {
        try {
          await new Promise((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            deleteReq.onerror = () => resolve(); // No error si no existe
            deleteReq.onsuccess = () => resolve();
            deleteReq.onblocked = () => resolve();
          });
          console.log(`✓ Cleared IndexedDB: ${dbName}`);
        } catch (e) {
          console.log(`⚠️  Could not clear IndexedDB: ${dbName}`);
        }
      }
    } catch (e) {
      console.log('⚠️  IndexedDB cleanup failed:', e.message);
    }
  }
  
  console.log('✅ All cache cleared! Ready for fresh reload.');
  return true;
}

// Función para diagnosticar problemas de caché
async function devDiagnoseCache() {
  console.log('🔍 Cache Diagnosis Report');
  console.log('=======================');
  
  // Service Worker Status
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    console.log('Service Worker:', registration ? 'Registered' : 'Not registered');
    if (registration) {
      console.log('  - Active:', !!registration.active);
      console.log('  - Waiting:', !!registration.waiting);
      console.log('  - Installing:', !!registration.installing);
    }
  }
  
  // Cache Storage
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log(`Cache Storage: ${cacheNames.length} cache(s)`);
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      console.log(`  - ${cacheName}: ${requests.length} items`);
    }
  }
  
  // Storage Usage
  if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = (estimate.usage / 1024 / 1024).toFixed(2);
    const quota = (estimate.quota / 1024 / 1024).toFixed(2);
    console.log(`Storage Usage: ${used}MB / ${quota}MB`);
  }
  
  // Network Status
  console.log('Network:', navigator.onLine ? 'Online' : 'Offline');
  
  console.log('=======================');
}

// Función para detectar cambios en archivos clave
function devWatchForChanges() {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    const url = args[0];
    
    // Log requests a archivos clave
    if (typeof url === 'string' && (
      url.includes('.js') || 
      url.includes('.css') || 
      url.includes('.html')
    )) {
      console.log(`📡 Fetch: ${url} - ${response.status} (${response.headers.get('cache-control') || 'no cache-control'})`);
    }
    
    return response;
  };
  
  console.log('🔍 Watching fetch requests for key files...');
}

// Exponer utilidades globalmente en desarrollo
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  window.devUtils = {
    clearAllCache: devClearAllCache,
    diagnoseCache: devDiagnoseCache,
    watchChanges: devWatchForChanges
  };
  
  console.log('🛠️  Dev Utils loaded! Available commands:');
  console.log('  - devUtils.clearAllCache() - Nuclear cache clear');
  console.log('  - devUtils.diagnoseCache() - Cache diagnosis report');
  console.log('  - devUtils.watchChanges() - Watch fetch requests');
}

export { devClearAllCache, devDiagnoseCache, devWatchForChanges };

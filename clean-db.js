/**
 * Script de limpieza rápida - pegar en la consola del navegador
 */

// Limpiar todo y recargar
async function cleanAndReload() {
  console.log('🧹 Iniciando limpieza completa...');
  
  // 1. Limpiar Service Worker caches
  if (window.cacheUtils) {
    await window.cacheUtils.clearAll();
  }
  
  // 2. Limpiar todo (localStorage, IndexedDB, etc.)
  if (window.devUtils) {
    await window.devUtils.clearAllCache();
  } else {
    // Fallback manual
    localStorage.clear();
    sessionStorage.clear();
    
    // Borrar bases de datos conocidas
    const dbNames = ['pos_pizzeria_v7', 'pos-pizzeria-db', 'pos-pizzeria'];
    for (const dbName of dbNames) {
      try {
        await new Promise((resolve) => {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onsuccess = deleteReq.onerror = deleteReq.onblocked = resolve;
        });
        console.log(`✓ DB ${dbName} limpiada`);
      } catch (e) {
        console.log(`⚠️ No se pudo limpiar ${dbName}`);
      }
    }
  }
  
  console.log('✅ Limpieza completa, recargando...');
  setTimeout(() => window.location.reload(true), 500);
}

// Ejecutar
cleanAndReload();

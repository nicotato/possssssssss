/**
 * Script para limpiar completamente la base de datos RxDB
 * Usar cuando hay conflictos de esquema
 */

// Función para limpiar base de datos específica
async function clearRxDB() {
  console.log('🧹 Iniciando limpieza completa de RxDB...');
  
  // 1. Cerrar conexión actual si existe
  if (typeof state !== 'undefined' && state.db) {
    try {
      await state.db.destroy();
      console.log('✓ Base de datos cerrada');
    } catch (e) {
      console.log('⚠️ Error cerrando DB:', e.message);
    }
  }
  
  // 2. Limpiar todas las bases de datos IndexedDB relacionadas
  const dbNames = [
    'pos_pizzeria_v7',
    'pos-pizzeria-db', 
    'pos-pizzeria',
    'rxdb-dexie',
    'pos_pizzeria' // posible variante
  ];
  
  for (const dbName of dbNames) {
    try {
      console.log(`Limpiando: ${dbName}...`);
      await new Promise((resolve, reject) => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onsuccess = () => {
          console.log(`✓ ${dbName} eliminada`);
          resolve();
        };
        deleteReq.onerror = () => {
          console.log(`⚠️ Error eliminando ${dbName}`);
          resolve(); // No bloquear por errores
        };
        deleteReq.onblocked = () => {
          console.log(`⚠️ ${dbName} bloqueada, continuando...`);
          resolve();
        };
      });
    } catch (e) {
      console.log(`⚠️ Error con ${dbName}:`, e.message);
    }
  }
  
  // 3. Limpiar localStorage relacionado
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('rxdb') || key.includes('pos') || key.includes('dexie'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✓ Removido localStorage: ${key}`);
  });
  
  // 4. Limpiar service worker cache
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log(`✓ Limpiados ${cacheNames.length} caches del service worker`);
  }
  
  console.log('✅ Limpieza completa finalizada');
  console.log('🔄 Recargando página en 2 segundos...');
  
  setTimeout(() => {
    window.location.reload(true);
  }, 2000);
}

// Función específica para el error de sync_queue
async function fixSyncQueueError() {
  console.log('🔧 Arreglando error específico de sync_queue...');
  
  // Solo limpiar la colección problemática
  try {
    if (typeof state !== 'undefined' && state.db && state.db.sync_queue) {
      const docs = await state.db.sync_queue.find().exec();
      console.log(`Encontrados ${docs.length} documentos en sync_queue`);
      
      for (const doc of docs) {
        await doc.remove();
      }
      console.log('✓ sync_queue limpiada');
    }
    
    // Limpiar específicamente IndexedDB de sync_queue
    await new Promise((resolve) => {
      const deleteReq = indexedDB.deleteDatabase('pos_pizzeria_v7');
      deleteReq.onsuccess = deleteReq.onerror = deleteReq.onblocked = resolve;
    });
    
    console.log('✅ Error de sync_queue corregido');
    console.log('🔄 Recarga la página para aplicar los cambios');
    
  } catch (e) {
    console.log('❌ Error en la corrección:', e.message);
    console.log('💡 Usa clearRxDB() para limpieza completa');
  }
}

// Exponer funciones
window.dbFix = {
  clearAll: clearRxDB,
  fixSyncQueue: fixSyncQueueError
};

console.log('🛠️ Herramientas de reparación de DB cargadas:');
console.log('  - dbFix.clearAll() - Limpieza completa');
console.log('  - dbFix.fixSyncQueue() - Solo arreglar sync_queue');
console.log('');
console.log('💡 Para el error actual, ejecuta: dbFix.clearAll()');

// Auto-ejecutar si detectamos el error específico
if (window.location.search.includes('fix-db')) {
  console.log('🔧 Auto-ejecutando limpieza...');
  clearRxDB();
}

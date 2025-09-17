// Script para limpiar la base de datos local
console.log('🧹 Limpiando base de datos local...');

// Limpiar IndexedDB
if ('indexedDB' in window) {
  // Lista de nombres de bases de datos que típicamente usa RxDB
  const dbNames = ['pos_pizzeria_v7', 'pos_pizzeria', 'pos-db', 'rxdb-pos'];
  
  dbNames.forEach(async (dbName) => {
    try {
      const deleteReq = indexedDB.deleteDatabase(dbName);
      deleteReq.onsuccess = () => {
        console.log(`✅ DB ${dbName} eliminada`);
      };
      deleteReq.onerror = () => {
        console.log(`⚠️ DB ${dbName} no encontrada o ya eliminada`);
      };
    } catch (e) {
      console.log(`❌ Error eliminando ${dbName}:`, e);
    }
  });
}

// Limpiar localStorage
if ('localStorage' in window) {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('pos') || key.includes('rxdb') || key.includes('cart') || key.includes('auth'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed localStorage key: ${key}`);
  });
}

// Limpiar sessionStorage
if ('sessionStorage' in window) {
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('pos') || key.includes('rxdb') || key.includes('cart') || key.includes('auth'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️ Removed sessionStorage key: ${key}`);
  });
}

console.log('✨ Limpieza completada. Recarga la página para reinicializar.');
console.log('💡 Para recargar: window.location.reload()');
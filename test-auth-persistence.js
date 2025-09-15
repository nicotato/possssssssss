/**
 * Script de prueba de persistencia de sesión
 * Copiar y pegar en la consola del navegador
 */

console.log('=== PRUEBA DE PERSISTENCIA DE SESIÓN ===');

// 1. Verificar estado de autenticación
console.log('1. Estado de autenticación:');
if (typeof state !== 'undefined' && state.services && state.services.auth) {
  console.log('  - Autenticado:', state.services.auth.isAuthenticated());
  console.log('  - Usuario:', state.services.auth.getUsername());
  console.log('  - Completamente inicializado:', state.services.auth.isFullyAuthenticated());
  console.log('  - Permisos cargados:', state.services.auth.permissionsCache.size);
} else {
  console.log('  - Estado no disponible aún');
}

// 2. Verificar localStorage
console.log('2. Datos en localStorage:');
const sessionData = localStorage.getItem('pos_session');
if (sessionData) {
  try {
    const parsed = JSON.parse(sessionData);
    console.log('  - Sesión guardada:', parsed);
    console.log('  - Usuario:', parsed.username);
    console.log('  - Expira:', new Date(parsed.expiresAt));
    console.log('  - Válida:', new Date(parsed.expiresAt) > new Date());
  } catch (e) {
    console.log('  - Error parseando sesión:', e);
  }
} else {
  console.log('  - No hay sesión guardada');
}

// 3. Simular refresh
console.log('3. Para probar refresh:');
console.log('  - Haz login normalmente');
console.log('  - Luego recarga la página (F5 o Ctrl+R)');
console.log('  - Deberías seguir logueado');

// 4. Funciones de debug
window.debugAuth = {
  showSession: () => {
    const session = localStorage.getItem('pos_session');
    console.log('Sesión actual:', session ? JSON.parse(session) : null);
  },
  clearSession: () => {
    localStorage.removeItem('pos_session');
    console.log('Sesión limpiada');
  },
  forceLogin: async () => {
    if (typeof state !== 'undefined' && state.services && state.services.auth) {
      try {
        await state.services.auth.login('admin', 'admin123');
        console.log('Login forzado exitoso');
        if (window.updateUserInfo) window.updateUserInfo();
        updateVisibility(state);
      } catch (e) {
        console.log('Error en login forzado:', e.message);
      }
    }
  }
};

console.log('4. Funciones de debug disponibles:');
console.log('  - debugAuth.showSession() - Ver sesión actual');
console.log('  - debugAuth.clearSession() - Limpiar sesión');  
console.log('  - debugAuth.forceLogin() - Hacer login como admin');

console.log('=== FIN PRUEBA ===');

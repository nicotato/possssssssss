// Test script para verificar funcionalidad del logout
console.log('🧪 Test: Verificando funcionalidad de logout');

// Simular click en el botón de logout después de un delay
setTimeout(() => {
  const logoutBtn = document.querySelector('.header__logout-btn');
  if (logoutBtn) {
    console.log('✅ Botón de logout encontrado:', logoutBtn);
    console.log('🎯 Simulando click...');
    logoutBtn.click();
  } else {
    console.log('❌ Botón de logout no encontrado');
    console.log('🔍 Botones disponibles:', document.querySelectorAll('button'));
  }
}, 2000);

// Verificar estilos del header
setTimeout(() => {
  const header = document.querySelector('.header');
  if (header) {
    const styles = window.getComputedStyle(header);
    console.log('🎨 Header encontrado con estilos:');
    console.log('  - Background:', styles.background);
    console.log('  - Color:', styles.color);
    console.log('  - Box-shadow:', styles.boxShadow);
  } else {
    console.log('❌ Header no encontrado');
  }
}, 1000);
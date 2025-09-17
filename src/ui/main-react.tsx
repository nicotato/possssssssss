import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { AppStateProvider } from './AppContext.tsx';
import { createAppEnvironment } from './bootstrap-react.ts';

// Import modular SCSS architecture
// TEMP fallback: legacy global CSS until full parity achieved (load first)
import '../../style.css';
// Modular SCSS architecture (can override legacy rules)
import '@styles/main.scss';
// Legacy isolated partials still in use (will be migrated gradually)
import './styles/base.scss';
import './styles/modal.scss';

function logPhase(phase: string) {
  // eslint-disable-next-line no-console
  console.log(`[BOOT] ${phase} @ ${new Date().toISOString()}`);
}

function updateLoadingProgress(percent: number, message?: string) {
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.querySelector('.initial-loader p');
  
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
    progressFill.style.animation = 'none'; // Detener animación automática
  }
  
  if (message && progressText) {
    progressText.textContent = message;
  }
}

function hideLoader() {
  document.body.classList.add('app-loaded');
  
  // Remover completamente después de la transición
  setTimeout(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.remove();
    }
  }, 500);
}

(async () => {
  try {
    logPhase('start');
    updateLoadingProgress(10, 'Iniciando sistema...');

    // Para diagnosticar, usar bootstrap simple:
    // const { services, repos, db } = await createSimpleAppEnvironment();

    // Bootstrap normal (comentar línea anterior y descomentar esta):
    updateLoadingProgress(25, 'Inicializando base de datos...');
    const { services, repos, db } = await createAppEnvironment();

    logPhase('env-created');
    updateLoadingProgress(70, 'Configurando servicios...');

    const container = document.getElementById('react-root');
    if (!container) {
      console.error('Elemento #react-root no encontrado');
      return;
    }
    
    updateLoadingProgress(90, 'Cargando interfaz...');
    
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <AppStateProvider value={{ services, repos, rawState: { services, repos, db } }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppStateProvider>
      </React.StrictMode>
    );
    
    logPhase('render-complete');
    updateLoadingProgress(100, '¡Listo!');
    
    // Pequeña pausa para mostrar el 100% antes de ocultar
    setTimeout(() => {
      hideLoader();
    }, 300);
  } catch (err) {
    const container = document.getElementById('react-root');
    const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    console.error('[Bootstrap Error]', err);
    console.error('[Bootstrap Error Stack]', err instanceof Error ? err.stack : 'No stack trace');

    // Mostrar error también en el DOM
    const errorHtml = `
      <div style="padding:20px;color:red;background:#ffe6e6;border:1px solid red;margin:20px;">
        <h3>Error de Inicialización</h3>
        <pre style="white-space:pre-wrap;font-size:11px;">${msg.replace(/</g, '&lt;')}</pre>
      </div>
    `;

    if (container) {
      container.innerHTML = errorHtml;
    } else {
      document.body.insertAdjacentHTML('beforeend', errorHtml);
    }
  }
})();

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { SimpleApp } from './SimpleApp.tsx';
import { AppStateProvider } from './AppContext.tsx';
import { createAppEnvironment } from './bootstrap-react.ts';
import { createSimpleAppEnvironment } from './bootstrap-simple.ts';

function logPhase(phase: string) {
  // eslint-disable-next-line no-console
  console.log(`[BOOT] ${phase} @ ${new Date().toISOString()}`);
}

(async () => {
  try {
    logPhase('start');
    
    // Para diagnosticar, usar bootstrap simple:
    // const { services, repos, db } = await createSimpleAppEnvironment();
    
    // Bootstrap normal (comentar línea anterior y descomentar esta):
    const { services, repos, db } = await createAppEnvironment();
    
    logPhase('env-created');

    const container = document.getElementById('react-root');
    if (!container) {
      console.error('Elemento #react-root no encontrado');
      return;
    }
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
  } catch (err) {
    const container = document.getElementById('react-root');
    const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    console.error('[Bootstrap Error]', err);
    console.error('[Bootstrap Error Stack]', err instanceof Error ? err.stack : 'No stack trace');
    
    // Mostrar error también en el DOM
    const errorHtml = `
      <div style="padding:20px;color:red;background:#ffe6e6;border:1px solid red;margin:20px;">
        <h3>Error de Inicialización</h3>
        <pre style="white-space:pre-wrap;font-size:11px;">${msg.replace(/</g,'&lt;')}</pre>
      </div>
    `;
    
    if (container) {
      container.innerHTML = errorHtml;
    } else {
      document.body.insertAdjacentHTML('beforeend', errorHtml);
    }
  }
})();

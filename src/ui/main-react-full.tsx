import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { AppStateProvider } from './AppContext.tsx';
import { createAppEnvironment } from './bootstrap-react.ts';
import './styles/base.scss';

function Root() {
  const [env, setEnv] = useState<any>(null);
  const [error, setError] = useState<string>('');
  useEffect(()=>{(async()=>{
    try {
      const e = await createAppEnvironment();
      setEnv(e);
    } catch(err:any) {
      console.error(err);
      setError(err.message||'Error inicializando');
    }
  })();},[]);
  if(error) return <div style={{padding:'2rem'}}><h2>Error</h2><p>{error}</p></div>;
  if(!env) return <div style={{padding:'2rem'}}><p>Cargando...</p></div>;
  return (
    <AppStateProvider value={{ services: env.services, repos: env.repos, rawState: env }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppStateProvider>
  );
}

const container = document.getElementById('react-root');
if(container) {
  const root = createRoot(container);
  root.render(<Root />);
} else {
  console.error('#react-root no encontrado');
}

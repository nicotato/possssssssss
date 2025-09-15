import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppState } from './AppContext.tsx';

// Versión muy simple de login para pruebas
const SimpleLoginPage: React.FC = () => {
  const { services } = useAppState();
  const [msg, setMsg] = React.useState('');
  
  const tryLogin = async () => {
    try {
      await services.auth.login('admin', 'admin123');
      setMsg('Login exitoso - redirigiendo...');
      window.location.href = '/menu';
    } catch(e: any) {
      setMsg(e.message || 'Error de login');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Login Simple</h2>
      <button onClick={tryLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Login como Admin
      </button>
      {msg && <p style={{ color: msg.includes('exitoso') ? 'green' : 'red', marginTop: '1rem' }}>{msg}</p>}
    </div>
  );
};

// Versión simple del menú para pruebas
const SimpleMenuPage: React.FC = () => {
  const { services, repos } = useAppState();
  const [products, setProducts] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    (async () => {
      try {
        const list = await repos.products.getAll();
        setProducts(list);
      } catch (error) {
        console.error('Error cargando productos:', error);
      }
    })();
  }, [repos.products]);

  const logout = () => {
    services.auth.logout();
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Menú Simple</h2>
        <button onClick={logout} style={{ padding: '8px 16px' }}>Logout</button>
      </div>
      
      <h3>Productos:</h3>
      {products.length === 0 ? (
        <p>Cargando productos...</p>
      ) : (
        <ul>
          {products.map(p => (
            <li key={p.id} style={{ marginBottom: '8px' }}>
              <strong>{p.name}</strong> - ${p.basePrice}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Componente Protected simplificado
const SimpleProtected: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { services } = useAppState();
  
  if (!services?.auth) {
    return <div>Error: Auth service no disponible</div>;
  }
  
  try {
    if (!services.auth.isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return <Navigate to="/login" replace />;
  }
};

export const SimpleApp: React.FC = () => {
  const location = useLocation();
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: '#fff', padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ margin: 0, color: '#333' }}>POS Pizzería - Modo Diagnóstico</h1>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#666' }}>
          Ruta actual: {location.pathname}
        </p>
      </div>
      
      <main>
        <Routes>
          <Route path="/login" element={<SimpleLoginPage />} />
          <Route path="/menu" element={<SimpleProtected><SimpleMenuPage /></SimpleProtected>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
};

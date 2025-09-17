import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar.tsx';
import { SideDrawer } from './components/SideDrawer.tsx';
import { SyncStatus } from './components/SyncStatus.tsx';
import { ToastProvider } from './components/ToastProvider.tsx';
import { ConfirmProvider } from './components/ConfirmProvider.tsx';
import { FormModalProvider } from './hooks/useFormModal.js';
import { DiagnosticInfo } from './components/DiagnosticInfo.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { AuditPage } from './pages/AuditPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { UsersPage } from './pages/UsersPage.tsx';
import { RolesPage } from './pages/RolesPage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { VentasPage } from './pages/VentasPage.tsx';
import { OrdersAdminPage } from './pages/OrdersAdminPage.tsx';
import { ConfigurationPage } from './pages/ConfigurationPage.tsx';
import { TaxManagementPage } from './pages/TaxManagementPage.tsx';
import { FormDemoPage } from './pages/FormDemoPage.tsx';
import { ComponentsDemo } from './pages/ComponentsDemo.tsx';
import { LoginModernExample } from './pages/LoginModernExample.tsx';
import { useAppState } from './AppContext.tsx';

const Protected: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { services } = useAppState();
  
  // Verificar que services y auth existan antes de usarlos
  if (!services?.auth) {
    console.error('Auth service not available');
    return <Navigate to="/login" replace />;
  }
  
  try {
    if(!services.auth.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    console.log('User is authenticated, rendering protected content');
    return <>{children}</>;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return <Navigate to="/login" replace />;
  }
};

const Placeholder: React.FC<{title:string}> = ({ title }) => (
  <div style={{padding:'1rem'}}>
    <h2>{title}</h2>
    <p style={{fontSize:'.75rem',color:'#666'}}>Vista aún no migrada a React. TODO.</p>
  </div>
);

export const App: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <ToastProvider>
      <ConfirmProvider>
        <FormModalProvider>
          <div className={`layout ${isDrawerOpen ? 'drawer-open' : ''}`}>
            <SideDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
            <NavBar onMenuToggle={toggleDrawer} />
            <main className="main">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/productos" element={<Protected><ProductsPage /></Protected>} />
                <Route path="/menu" element={<Protected><MenuPage /></Protected>} />
                <Route path="/ventas" element={<Protected><VentasPage /></Protected>} />
                <Route path="/ordenes" element={<Protected><OrdersAdminPage /></Protected>} />
                <Route path="/roles" element={<Protected><RolesPage /></Protected>} />
                <Route path="/usuarios" element={<Protected><UsersPage /></Protected>} />
                <Route path="/reportes" element={<Protected><ReportsPage /></Protected>} />
                <Route path="/audit" element={<Protected><AuditPage /></Protected>} />
                <Route path="/configuracion" element={<Protected><ConfigurationPage /></Protected>} />
                <Route path="/impuestos" element={<Protected><TaxManagementPage /></Protected>} />
                <Route path="/form-demo" element={<Protected><FormDemoPage /></Protected>} />
                <Route path="/components-demo" element={<Protected><ComponentsDemo /></Protected>} />
                <Route path="/login-modern" element={<Protected><LoginModernExample /></Protected>} />
                <Route path="/sync" element={<Protected><Placeholder title="Sync" /></Protected>} />
                <Route path="*" element={<Navigate to="/menu" replace />} />
              </Routes>
            </main>
            <footer>© 2025 Pizzería del Barrio | POS Offline</footer>
            <SyncStatus />
            <DiagnosticInfo />
          </div>
        </FormModalProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
};

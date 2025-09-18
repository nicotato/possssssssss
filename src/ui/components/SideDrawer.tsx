import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppState } from '../AppContext.tsx';

const NAV_ITEMS: { path: string; label: string; icon: string; perm?: string }[] = [
  { path: '/menu', label: 'Menú', icon: '🍕', perm: 'PRODUCT_VIEW' },
  { path: '/ventas', label: 'Ventas', icon: '💰', perm: 'SALE_VIEW' },
  { path: '/ordenes', label: 'Órdenes', icon: '📋', perm: 'SALE_VIEW' },
  { path: '/kds', label: 'Kitchen Display', icon: '🍳', perm: 'KITCHEN_VIEW' },
  { path: '/productos', label: 'Productos', icon: '🛍️', perm: 'PRODUCT_VIEW' },
  { path: '/promociones', label: 'Promociones', icon: '🎁', perm: 'PRODUCT_VIEW' },
  { path: '/promo-sim', label: 'Simulación Promociones', icon: '🎯', perm: 'PRODUCT_VIEW' },
  { path: '/price-experiments', label: 'Experimentos Precios', icon: '📊', perm: 'PRODUCT_VIEW' },
  { path: '/merma', label: 'Gestión de Merma', icon: '🗑️', perm: 'PRODUCT_VIEW' },
  { path: '/roles', label: 'Roles', icon: '👥', perm: 'ROLE_VIEW' },
  { path: '/usuarios', label: 'Usuarios', icon: '👤', perm: 'USER_VIEW' },
  { path: '/reportes', label: 'Reportes', icon: '📊', perm: 'REPORT_VIEW' },
  { path: '/audit', label: 'Auditoría', icon: '🔍', perm: 'AUDIT_VIEW' },
  { path: '/configuracion', label: 'Configuración', icon: '⚙️', perm: 'USER_VIEW' },
  { path: '/impuestos', label: 'Impuestos', icon: '🧾', perm: 'TAX_VIEW' },
  { path: '/form-demo', label: 'Demo Formularios', icon: '🎨', perm: 'PRODUCT_VIEW' },
  { path: '/components-demo', label: 'Componentes', icon: '🧩', perm: 'PRODUCT_VIEW' },
  { path: '/login-modern', label: 'Login Moderno', icon: '🔐', perm: 'PRODUCT_VIEW' },
  { path: '/sync', label: 'Sync', icon: '🔄', perm: 'SYNC_RUN' }
];

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const { services } = useAppState();
  const location = useLocation();
  const isAuth = services?.auth?.isAuthenticated() || false;
  const isFull = services?.auth?.isFullyAuthenticated?.() || false;
  const username = services?.auth?.getUsername?.() || null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    services?.auth?.logout();
    onClose();
  };

  if (!isAuth) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="drawer-overlay" 
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`side-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>🍕 Pizzería del Barrio</h3>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        
        {username && (
          <div className="drawer-user">
            <div className="user-info">
              <span className="user-name">{username}</span>
              <span className="user-role">Usuario activo</span>
            </div>
          </div>
        )}
        
        <nav className="drawer-nav">
          <ul>
            {NAV_ITEMS.map(item => {
              if (item.perm && (!isFull || !services?.auth?.hasPermission(item.perm))) return null;
              
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={isActive ? 'active' : ''}
                    onClick={onClose}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="drawer-footer">
            <button 
              className="logout-btn" 
              onClick={handleLogout}
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

interface DrawerToggleProps {
  onClick: () => void;
}

export const DrawerToggle: React.FC<DrawerToggleProps> = ({ onClick }) => {
  return (
    <button className="drawer-toggle" onClick={onClick}>
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
};

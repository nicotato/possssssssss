import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../AppContext.tsx';
import { DrawerToggle } from './SideDrawer.tsx';

interface NavBarProps {
  onMenuToggle: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ onMenuToggle }) => {
  const { services } = useAppState();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<{ isAuth: boolean; username: string | null }>({ isAuth: false, username: null });

  // Efecto para actualizar el estado de autenticación
  useEffect(() => {
    if (!services?.auth) return;

    const updateAuthState = () => {
      try {
        const isAuth = services.auth.isAuthenticated();
        const username = services.auth.getUsername?.() || null;
        setAuthState({ isAuth, username });
      } catch (error) {
        console.error('Error checking auth in NavBar:', error);
        setAuthState({ isAuth: false, username: null });
      }
    };

    // Actualizar inmediatamente
    updateAuthState();

    // Polling para detectar cambios (solo cuando no está autenticado)
    const interval = setInterval(() => {
      const currentAuth = services.auth.isAuthenticated();
      if (currentAuth !== authState.isAuth) {
        updateAuthState();
      }
    }, 300);

    return () => clearInterval(interval);
  }, [services?.auth, authState.isAuth]);

  const handleLogout = () => {
    try {
      services?.auth?.logout();
      setAuthState({ isAuth: false, username: null });
      // Redirigir al login después del logout
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="header">
      <div className="header__container">
        <div className="header__brand">
          {authState.isAuth && <DrawerToggle onClick={onMenuToggle} />}
          <h1 className="header__brand-text">🍕 Pizzería del Barrio</h1>
        </div>
        
        <div className="header__actions">
          {authState.isAuth && authState.username && (
            <div className="header__user">
              <span className="header__username">👤 {authState.username}</span>
              <button className="header__logout-btn" onClick={handleLogout}>
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

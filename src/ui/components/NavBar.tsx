import React from 'react';
import { useAppState } from '../AppContext.tsx';
import { DrawerToggle } from './SideDrawer.tsx';

interface NavBarProps {
  onMenuToggle: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ onMenuToggle }) => {
  const { services } = useAppState();
  const isAuth = services?.auth?.isAuthenticated() || false;
  const username = services?.auth?.getUsername?.() || null;

  const handleLogout = () => {
    services?.auth?.logout();
  };

  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        {isAuth && <DrawerToggle onClick={onMenuToggle} />}
        <h1 className="app-title">🍕 Pizzería del Barrio</h1>
      </div>
      
      <div className="navbar-right">
        {isAuth && username && (
          <div className="user-section">
            <span className="username">👤 {username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

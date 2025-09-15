import React from 'react';
import { useAppState } from '../AppContext.tsx';
import { useServices } from '../hooks/useServices.ts';
import { useCart } from '../hooks/useCart.ts';

export const DiagnosticInfo: React.FC = () => {
  const appState = useAppState();
  const services = useServices();
  const cart = useCart();

  if (!appState) return <div>❌ AppState no disponible</div>;

  return (
    <div style={{
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      borderRadius: '5px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🔍 Estado del Sistema</h4>
      <div>✅ AppState: OK</div>
      <div>{services?.auth ? '✅' : '❌'} Auth Service: {services?.auth ? 'OK' : 'FALTA'}</div>
      <div>{services?.auth?.isAuthenticated?.() ? '✅' : '❌'} Usuario autenticado: {services?.auth?.isAuthenticated?.() ? 'SÍ' : 'NO'}</div>
      <div>{cart?.canSell ? '✅' : '❌'} Puede vender: {cart?.canSell ? 'SÍ' : 'NO'}</div>
      <div>🛒 Items en carrito: {cart?.lines?.length || 0}</div>
      <div>📦 Productos disponibles: {appState.repos?.products ? 'SÍ' : 'NO'}</div>
    </div>
  );
};

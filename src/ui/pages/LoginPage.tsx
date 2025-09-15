import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../AppContext.tsx';
import { Input, Button } from '../components/index.js';

export const LoginPage: React.FC = () => {
  const { services } = useAppState();
  const nav = useNavigate();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tryLogin = async () => {
    if(!username || !password) { 
      setMsg('Complete usuario y contraseña'); 
      return; 
    }
    
    setIsLoading(true);
    setMsg('');
    
    try {
      await services.auth.login(username, password);
      setMsg('');
      nav('/menu');
    } catch(e:any) {
      setMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      tryLogin();
    }
  };

  return (
    <section className="cliente-form" style={{maxWidth:420, margin:'2rem auto'}}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍕</div>
        <h2>Iniciar Sesión</h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Accede a tu cuenta del POS</p>
      </div>
      
      <div className="form-group">
        <Input
          label="Usuario"
          placeholder="Ingresa tu usuario"
          value={username}
          onChange={e => setU(e.target.value)}
          onKeyPress={handleKeyPress}
          error={msg && !username ? 'El usuario es requerido' : undefined}
          leftIcon={<span>👤</span>}
          required
          autoComplete="username"
          disabled={isLoading}
        />
        
        <Input
          type="password"
          variant="floating"
          label="Contraseña"
          value={password}
          onChange={e => setP(e.target.value)}
          onKeyPress={handleKeyPress}
          error={msg && !password ? 'La contraseña es requerida' : undefined}
          rightIcon={<span>🔒</span>}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
        
        <Button
          variant="primary"
          onClick={tryLogin}
          loading={isLoading}
          fullWidth
          leftIcon="🚀"
          className="mt-2"
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </div>
      
      {msg && !(!username || !password) && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius)',
          color: 'var(--color-danger)',
          fontSize: '0.875rem',
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          ⚠️ {msg}
        </div>
      )}
      
      <div style={{
        fontSize: '0.7rem', 
        color: '#6b7280', 
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--radius)',
        textAlign: 'center'
      }}>
        <strong>Credenciales de prueba:</strong><br/>
        Demo: admin / admin123<br/>
        Caja: caja / caja123
      </div>

      {/* CSS para el spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

import React, { useState } from 'react';
import { Input } from '../components/index.js';
import { useAppState } from '../AppContext.tsx';

export function LoginModernExample() {
  const { services } = useAppState();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!username.trim()) {
      setError('El usuario es requerido');
      return;
    }

    if (!password) {
      setError('La contraseña es requerida');
      return;
    }

    setIsLoading(true);

    try {
      // Simulamos la llamada de login
      await services?.auth?.login(username, password);
      console.log('Login exitoso');
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container" style={{ maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍕</div>
          <h1 className="form-title">Iniciar Sesión</h1>
          <p style={{ color: '#6b7280' }}>Accede a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Usuario con icono */}
          <Input
            type="text"
            label="Usuario"
            placeholder="Ingresa tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={error && !username ? 'El usuario es requerido' : undefined}
            leftIcon={<span>👤</span>}
            required
            autoComplete="username"
          />

          {/* Contraseña con variante floating */}
          <Input
            type="password"
            variant="floating"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error && !password ? 'La contraseña es requerida' : undefined}
            rightIcon={<span>🔒</span>}
            required
            autoComplete="current-password"
          />

          {/* Mensaje de error global */}
          {error && !(!username || !password) && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius)',
              color: 'var(--color-danger)',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Botón de login */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ 
              width: '100%',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {isLoading ? (
              <>
                <span style={{ 
                  display: 'inline-block', 
                  width: '1rem', 
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem'
                }} />
                Iniciando sesión...
              </>
            ) : (
              '🚀 Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Información adicional */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>💡 Ejemplo de migración</h4>
          <p>Esta es una demostración de cómo migrar el formulario de login existente usando los nuevos componentes estandarizados:</p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
            <li>Input con iconos personalizados</li>
            <li>Variantes de diseño (floating labels)</li>
            <li>Validación integrada con mensajes de error</li>
            <li>Estados de carga y loading</li>
            <li>Autocompletado y accesibilidad</li>
          </ul>
        </div>

        {/* CSS para el spinner */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '../components/Button.tsx';

export const ButtonsDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>
        🎨 Botones Estandarizados
      </h1>

      {/* Variants */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#374151' }}>
          Variantes de Botones
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
        </div>
      </section>

      {/* Sizes */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#374151' }}>
          Tamaños
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button size="small" variant="primary">Small</Button>
          <Button size="medium" variant="primary">Medium</Button>
          <Button size="large" variant="primary">Large</Button>
        </div>
      </section>

      {/* With Icons */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#374151' }}>
          Con Iconos
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button variant="primary" leftIcon="➕">Agregar</Button>
          <Button variant="outline" rightIcon="📁">Guardar</Button>
          <Button variant="danger" leftIcon="🗑️">Eliminar</Button>
          <Button variant="success" leftIcon="✅" rightIcon="📤">Completar y Enviar</Button>
        </div>
      </section>

      {/* States */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#374151' }}>
          Estados
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button variant="primary">Normal</Button>
          <Button variant="primary" disabled>Deshabilitado</Button>
          <Button 
            variant="primary" 
            loading={loading}
            onClick={handleLoadingDemo}
          >
            {loading ? 'Cargando...' : 'Cargar'}
          </Button>
        </div>
      </section>

      {/* Full Width */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#374151' }}>
          Ancho Completo
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <Button variant="primary" fullWidth leftIcon="🚀">
            Botón de Ancho Completo
          </Button>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Button variant="outline" fullWidth>
            Outline Full Width
          </Button>
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#374151' }}>
          Casos de Uso Comunes
        </h2>
        
        {/* Cart Actions */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#4b5563' }}>
            Carrito de Compras
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Button variant="outline" size="small">-</Button>
            <span style={{ padding: '0 1rem', minWidth: '3rem', textAlign: 'center' }}>2</span>
            <Button variant="outline" size="small">+</Button>
            <Button variant="danger" size="small" leftIcon="🗑️">Eliminar</Button>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#4b5563' }}>
            Acciones de Modal
          </h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="primary" leftIcon="💾">Guardar</Button>
          </div>
        </div>

        {/* Admin Actions */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#4b5563' }}>
            Acciones de Administración
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="small" leftIcon="📄">Factura</Button>
            <Button variant="outline" size="small" leftIcon="🍳">Comanda</Button>
            <Button variant="warning" size="small">Anular</Button>
            <Button variant="success" size="small">Entregar</Button>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#374151' }}>
          Ejemplos de Código
        </h2>
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <pre style={{ margin: 0, fontSize: '0.9rem', color: '#495057' }}>
{`// Botón básico
<Button variant="primary">Click me</Button>

// Con icono y loading
<Button 
  variant="success" 
  leftIcon="✅"
  loading={isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting ? 'Guardando...' : 'Guardar'}
</Button>

// Botón de acción destructiva
<Button 
  variant="danger" 
  size="small"
  leftIcon="🗑️"
  onClick={handleDelete}
>
  Eliminar
</Button>`}
          </pre>
        </div>
      </section>
    </div>
  );
};

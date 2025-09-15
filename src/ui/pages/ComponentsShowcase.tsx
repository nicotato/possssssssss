import React, { useState } from 'react';
import { 
  Input, TextArea, Select, Button, 
  Card, CardHeader, CardBody, CardFooter,
  Badge, StatusBadge, 
  Alert, InfoAlert, SuccessAlert, WarningAlert, DangerAlert,
  Loading, LoadingSkeleton,
  type SelectOption 
} from '../components/index.js';

export const ComponentsShowcase: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  const selectOptions: SelectOption[] = [
    { value: 'option1', label: 'Opción 1' },
    { value: 'option2', label: 'Opción 2' },
    { value: 'option3', label: 'Opción 3' }
  ];

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937', textAlign: 'center' }}>
        🎨 Sistema de Componentes Estandarizados
      </h1>

      {/* Alerts Section */}
      <Card variant="outlined" padding="large" className="mb-4">
        <CardHeader>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Alertas y Notificaciones</h2>
        </CardHeader>
        <CardBody>
          {showAlert && (
            <InfoAlert dismissible onDismiss={() => setShowAlert(false)} title="Información">
              Esta es una alerta informativa que puede ser cerrada.
            </InfoAlert>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <SuccessAlert title="¡Éxito!">
              La operación se completó correctamente.
            </SuccessAlert>
            <WarningAlert title="Advertencia">
              Algunos datos pueden estar desactualizados.
            </WarningAlert>
            <DangerAlert title="Error">
              Ocurrió un problema al procesar la solicitud.
            </DangerAlert>
          </div>
        </CardBody>
      </Card>

      {/* Form Components Section */}
      <Card variant="elevated" padding="large" className="mb-4">
        <CardHeader>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Componentes de Formulario</h2>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#4b5563' }}>Inputs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input placeholder="Input básico" variant="outline" />
                <Input placeholder="Con icono izquierdo" variant="outline" leftIcon="👤" />
                <Input placeholder="Con icono derecho" variant="outline" rightIcon="🔍" />
                <Input placeholder="Input floating" variant="floating" label="Etiqueta flotante" />
                <Input placeholder="Input filled" variant="filled" />
                <Input placeholder="Estado error" variant="outline" error="Este campo es obligatorio" />
                <Input placeholder="Estado success" variant="outline" success="Campo válido" />
                <Input type="password" placeholder="Contraseña" variant="outline" rightIcon="👁" />
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#4b5563' }}>TextArea y Select</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <TextArea placeholder="Escribe tu mensaje aquí..." variant="outline" rows={4} />
                <Select 
                  options={selectOptions} 
                  placeholder="Selecciona una opción"
                  variant="outline"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                />
                <TextArea placeholder="TextArea floating" variant="floating" label="Comentarios" />
                <TextArea placeholder="TextArea filled" variant="filled" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Buttons Section */}
      <Card variant="default" padding="large" className="mb-4">
        <CardHeader>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Botones</h2>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Variantes</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Tamaños y Estados</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Button variant="primary" size="small">Small</Button>
                <Button variant="primary" size="medium">Medium</Button>
                <Button variant="primary" size="large">Large</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" loading={loading} onClick={handleLoadingDemo}>
                  {loading ? 'Cargando...' : 'Loading Demo'}
                </Button>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Con Iconos</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button variant="primary" leftIcon="➕">Agregar</Button>
                <Button variant="outline" rightIcon="📁">Guardar</Button>
                <Button variant="danger" leftIcon="🗑️">Eliminar</Button>
                <Button variant="success" leftIcon="✅" rightIcon="📤">Completar</Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Badges Section */}
      <Card variant="filled" padding="large" className="mb-4">
        <CardHeader>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Badges y Estados</h2>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Variantes de Badge</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Tamaños</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge variant="primary" size="small">Small</Badge>
                <Badge variant="primary" size="medium">Medium</Badge>
                <Badge variant="primary" size="large">Large</Badge>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Estados del Sistema</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusBadge status="completed" />
                <StatusBadge status="fulfilled" />
                <StatusBadge status="cancelled" />
                <StatusBadge status="pending" />
                <StatusBadge status="active" />
                <StatusBadge status="inactive" />
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Badges Removibles</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge variant="primary" removable onRemove={() => alert('Badge removido')}>
                  Removible
                </Badge>
                <Badge variant="success" removable onRemove={() => alert('Tag removido')}>
                  Tag
                </Badge>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading States Section */}
      <Card variant="outlined" padding="large" className="mb-4">
        <CardHeader>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Estados de Carga</h2>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Spinner</h3>
              <Loading variant="spinner" size="large" text="Cargando datos..." />
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Dots</h3>
              <Loading variant="dots" size="large" text="Procesando..." />
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Pulse</h3>
              <Loading variant="pulse" size="large" text="Sincronizando..." />
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#4b5563' }}>Skeleton</h3>
              <LoadingSkeleton lines={4} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Cards Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <Card variant="default" hoverable>
          <CardHeader actions={<Badge variant="success">Nuevo</Badge>}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Card con Header</h3>
          </CardHeader>
          <CardBody>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Este es un card con header que incluye acciones y efectos hover.
            </p>
          </CardBody>
          <CardFooter align="between">
            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Hace 2 horas</span>
            <Button variant="outline" size="small">Ver más</Button>
          </CardFooter>
        </Card>

        <Card variant="elevated" padding="large">
          <CardBody>
            <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>Card Elevado</h3>
            <p style={{ margin: '1rem 0', color: '#6b7280' }}>
              Card con sombra elevada y padding grande para contenido importante.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Badge variant="primary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="info">CSS</Badge>
            </div>
          </CardBody>
        </Card>

        <Card variant="outlined" onClick={() => alert('Card clickeable')}>
          <CardBody>
            <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>Card Clickeable</h3>
            <p style={{ margin: '1rem 0', color: '#6b7280' }}>
              Este card es completamente clickeable y responde a interacciones.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusBadge status="active" />
              <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Click para interactuar</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Implementation Examples */}
      <Card variant="filled" padding="large">
        <CardHeader>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Ejemplos de Implementación</h2>
        </CardHeader>
        <CardBody>
          <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '8px', color: '#f9fafb' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
{`// Formulario completo con componentes estandarizados
import { Input, Button, Card, Alert } from '../components';

const MyForm = () => (
  <Card variant="outlined" padding="large">
    <form>
      <Input 
        placeholder="Email" 
        type="email" 
        variant="outline" 
        leftIcon="📧"
        required 
      />
      <Input 
        placeholder="Contraseña" 
        type="password" 
        variant="outline" 
        leftIcon="🔒" 
        required 
      />
      <Button 
        type="submit" 
        variant="primary" 
        fullWidth 
        leftIcon="🚀"
      >
        Iniciar Sesión
      </Button>
    </form>
  </Card>
);`}
            </pre>
          </div>
        </CardBody>
        <CardFooter>
          <Badge variant="success">Lista para producción</Badge>
          <Badge variant="info">TypeScript</Badge>
          <Badge variant="primary">React 19</Badge>
        </CardFooter>
      </Card>
    </div>
  );
};
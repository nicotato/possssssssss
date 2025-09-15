import React, { useState } from 'react';

export const FormDemoPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
    newsletter: false,
    notifications: 'email'
  });

  const [showFloating, setShowFloating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>🎨 Formularios Modernos</h2>
        <p>Demostración de los nuevos estilos de inputs y formularios</p>
      </div>

      {/* Formulario básico */}
      <div className="demo-section">
        <h3>📝 Formulario Básico</h3>
        <div className="cliente-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="required">Nombre completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre completo"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Selecciona una categoría</option>
                <option value="cliente">Cliente</option>
                <option value="proveedor">Proveedor</option>
                <option value="empleado">Empleado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Mensaje</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Escribe tu mensaje aquí..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Floating Labels */}
      <div className="demo-section">
        <h3>✨ Etiquetas Flotantes</h3>
        <div className="cliente-form">
          <button 
            className="btn btn-ghost"
            onClick={() => setShowFloating(!showFloating)}
          >
            {showFloating ? '👆 Ocultar' : '👇 Mostrar'} Floating Labels
          </button>
          
          {showFloating && (
            <div style={{ marginTop: '1rem' }}>
              <div className="floating-label">
                <input type="text" placeholder=" " />
                <label>Nombre de usuario</label>
              </div>
              
              <div className="floating-label">
                <input type="email" placeholder=" " />
                <label>Correo electrónico</label>
              </div>
              
              <div className="floating-label">
                <select defaultValue="">
                  <option value="" disabled></option>
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                  <option value="guest">Invitado</option>
                </select>
                <label>Rol de usuario</label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input con iconos */}
      <div className="demo-section">
        <h3>🔍 Inputs con Iconos</h3>
        <div className="cliente-form">
          <div className="form-row">
            <div className="form-group">
              <label>Búsqueda con ícono</label>
              <div className="input-with-icon">
                <input type="search" placeholder="Buscar productos..." />
                <span className="input-icon">🔍</span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Usuario</label>
              <div className="input-with-icon">
                <input type="text" placeholder="Nombre de usuario" />
                <span className="input-icon">👤</span>
              </div>
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-with-icon">
                <input type="password" placeholder="Tu contraseña" />
                <span className="input-icon">🔒</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estados de inputs */}
      <div className="demo-section">
        <h3>🎯 Estados de Inputs</h3>
        <div className="cliente-form">
          <div className="form-row">
            <div className="form-group">
              <label>Input Normal</label>
              <input type="text" placeholder="Estado normal" />
            </div>
            <div className="form-group">
              <label>Input con Error</label>
              <input type="text" className="error" placeholder="Estado de error" />
              <div className="form-text text-error">Este campo tiene un error</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Input Exitoso</label>
              <input type="text" className="success" placeholder="Estado exitoso" />
              <div className="form-text text-success">✓ Campo validado correctamente</div>
            </div>
            <div className="form-group">
              <label>Input Deshabilitado</label>
              <input type="text" disabled placeholder="Campo deshabilitado" />
              <div className="form-text">Este campo está deshabilitado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkbox y Radio */}
      <div className="demo-section">
        <h3>☑️ Checkbox y Radio Buttons</h3>
        <div className="cliente-form">
          <div className="checkbox-group">
            <label>
              <input 
                type="checkbox" 
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleInputChange}
              />
              Suscribirme al boletín de noticias
            </label>
            <label>
              <input type="checkbox" />
              Acepto los términos y condiciones
            </label>
            <label>
              <input type="checkbox" />
              Quiero recibir ofertas especiales
            </label>
          </div>

          <div className="radio-group" style={{ marginTop: '1rem' }}>
            <h4>Método de notificación preferido:</h4>
            <label>
              <input 
                type="radio" 
                name="notifications" 
                value="email"
                checked={formData.notifications === 'email'}
                onChange={handleInputChange}
              />
              Correo electrónico
            </label>
            <label>
              <input 
                type="radio" 
                name="notifications" 
                value="sms"
                checked={formData.notifications === 'sms'}
                onChange={handleInputChange}
              />
              SMS
            </label>
            <label>
              <input 
                type="radio" 
                name="notifications" 
                value="none"
                checked={formData.notifications === 'none'}
                onChange={handleInputChange}
              />
              No recibir notificaciones
            </label>
          </div>
        </div>
      </div>

      {/* Botones modernos */}
      <div className="demo-section">
        <h3>🔘 Botones Modernos</h3>
        <div className="cliente-form">
          <h4>Botones básicos:</h4>
          <div className="form-actions" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn">✨ Primario</button>
            <button className="btn btn-secondary">📄 Secundario</button>
            <button className="btn btn-green">✅ Éxito</button>
            <button className="btn btn-danger">❌ Peligro</button>
            <button className="btn btn-outline">🔳 Outline</button>
            <button className="btn btn-ghost">👻 Ghost</button>
          </div>

          <h4>Tamaños:</h4>
          <div className="form-actions" style={{ gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-sm">Pequeño</button>
            <button className="btn">Normal</button>
            <button className="btn btn-lg">Grande</button>
            <button className="btn btn-xl">Extra Grande</button>
          </div>

          <h4>Estados:</h4>
          <div className="form-actions" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn">Activo</button>
            <button className="btn" disabled>Deshabilitado</button>
          </div>

          <h4>Grupo de botones:</h4>
          <div className="btn-group">
            <button className="btn">Opción 1</button>
            <button className="btn">Opción 2</button>
            <button className="btn">Opción 3</button>
          </div>
        </div>
      </div>

      {/* Botón flotante */}
      <button className="btn btn-float">
        ➕
      </button>
    </div>
  );
};

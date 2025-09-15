import React, { useState } from 'react';
import { Input, TextArea, Select } from '../components/index.js';

export function ComponentsDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bio: '',
    country: '',
    city: '',
    experience: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const countries = [
    { value: 'ar', label: 'Argentina' },
    { value: 'mx', label: 'México' },
    { value: 'es', label: 'España' },
    { value: 'co', label: 'Colombia' },
    { value: 'cl', label: 'Chile' }
  ];

  const experienceOptions = [
    { value: 'junior', label: 'Junior (0-2 años)' },
    { value: 'mid', label: 'Middle (2-5 años)' },
    { value: 'senior', label: 'Senior (5+ años)' },
    { value: 'lead', label: 'Tech Lead' },
    { value: 'manager', label: 'Engineering Manager' }
  ];

  const handleInputChange = (field: keyof typeof formData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.country) {
      newErrors.country = 'Selecciona un país';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      console.log('Form submitted:', formData);
    }
  };

  const getSuccessMessage = (field: keyof typeof formData) => {
    if (submitted && !errors[field] && formData[field]) {
      return '✓ Válido';
    }
    return undefined;
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1 className="form-title">🎨 Componentes de Formulario</h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
          Demostración de Input, TextArea y Select estandarizados
        </p>

        <form onSubmit={handleSubmit}>
          {/* Sección: Inputs básicos */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1f2937' }}>
              📝 Inputs Básicos
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Input
                label="Nombre completo"
                placeholder="Ingresa tu nombre"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={errors.name}
                success={getSuccessMessage('name')}
                required
                leftIcon={<span>👤</span>}
              />

              <Input
                type="email"
                label="Email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={errors.email}
                success={getSuccessMessage('email')}
                required
                leftIcon={<span>📧</span>}
              />

              <Input
                type="tel"
                label="Teléfono"
                placeholder="+54 9 11 1234-5678"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                helperText="Formato: código país + número"
                leftIcon={<span>📱</span>}
              />
            </div>
          </section>

          {/* Sección: Inputs con floating labels */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1f2937' }}>
              🏷️ Floating Labels
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Input
                type="password"
                variant="floating"
                label="Contraseña"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={errors.password}
                required
                rightIcon={<span>🔒</span>}
              />

              <Input
                type="password"
                variant="floating"
                label="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                error={errors.confirmPassword}
                success={formData.confirmPassword && !errors.confirmPassword ? '✓ Coinciden' : undefined}
                required
                rightIcon={<span>🔒</span>}
              />
            </div>
          </section>

          {/* Sección: Variantes de diseño */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1f2937' }}>
              🎨 Variantes de Diseño
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Input
                variant="outline"
                size="small"
                label="Input Outline (Pequeño)"
                placeholder="Diseño outline pequeño"
              />

              <Input
                variant="filled"
                size="large"
                label="Input Filled (Grande)"
                placeholder="Diseño filled grande"
              />
            </div>
          </section>

          {/* Sección: TextArea */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1f2937' }}>
              📝 Área de Texto
            </h2>
            
            <TextArea
              label="Biografía"
              placeholder="Cuéntanos sobre ti..."
              value={formData.bio}
              onChange={handleInputChange('bio')}
              helperText="Máximo 500 caracteres"
              rows={4}
              resize="vertical"
            />

            <TextArea
              variant="floating"
              label="Descripción del Proyecto"
              placeholder="Escribe aquí..."
              helperText="Con floating label"
              rows={3}
              resize="none"
            />
          </section>

          {/* Sección: Select */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1f2937' }}>
              📋 Selectores
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Select
                label="País"
                options={countries}
                value={formData.country}
                onChange={handleInputChange('country')}
                placeholder="Selecciona un país"
                error={errors.country}
                success={getSuccessMessage('country')}
                required
              />

              <Select
                variant="floating"
                label="Experiencia"
                options={experienceOptions}
                value={formData.experience}
                onChange={handleInputChange('experience')}
                placeholder="Selecciona tu nivel"
                helperText="Años de experiencia en desarrollo"
              />

              <Select
                variant="filled"
                size="small"
                label="Ciudad"
                value={formData.city}
                onChange={handleInputChange('city')}
                disabled
                helperText="Se habilitará después de seleccionar el país"
              >
                <option value="">Selecciona una ciudad</option>
                <option value="bsas">Buenos Aires</option>
                <option value="cdmx">Ciudad de México</option>
                <option value="madrid">Madrid</option>
              </Select>
            </div>
          </section>

          {/* Botones de acción */}
          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary">
              💾 Guardar Información
            </button>
            <button type="button" className="btn btn-outline" onClick={() => {
              setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                bio: '',
                country: '',
                city: '',
                experience: ''
              });
              setErrors({});
            }}>
              🗑️ Limpiar Formulario
            </button>
          </div>

          {submitted && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f0fdf4',
              border: '2px solid var(--color-green)',
              borderRadius: 'var(--radius)',
              color: 'var(--color-green)',
              textAlign: 'center',
              fontWeight: 500
            }}>
              ✅ Formulario enviado exitosamente
            </div>
          )}
        </form>
      </div>

      {/* Información técnica */}
      <div style={{ 
        marginTop: '3rem', 
        padding: '1.5rem', 
        backgroundColor: '#f8fafc', 
        borderRadius: 'var(--radius)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937' }}>
          📋 Características de los Componentes
        </h3>
        <ul style={{ color: '#6b7280', lineHeight: 1.6 }}>
          <li><strong>Input:</strong> Soporte para iconos, múltiples variantes (default, floating, outline, filled), estados de validación</li>
          <li><strong>TextArea:</strong> Redimensionamiento controlado, etiquetas flotantes, mismo sistema de validación</li>
          <li><strong>Select:</strong> Flecha personalizada, opciones como array o children, estados consistentes</li>
          <li><strong>Accesibilidad:</strong> ARIA labels, IDs únicos automáticos, navegación por teclado</li>
          <li><strong>Responsive:</strong> Adaptable a diferentes tamaños de pantalla</li>
        </ul>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SimpleModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  fields: Array<{
    name: string;
    label: string;
    type?: 'text' | 'select' | 'password';
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
  }>;
  initialData?: any;
}

export function SimpleModal({ title, isOpen, onClose, onSubmit, fields, initialData = {} }: SimpleModalProps) {
  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const modalStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999
  };

  const contentStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    border: '2px solid #007bff'
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #ddd'
  };

  const fieldStyles: React.CSSProperties = {
    marginBottom: '16px'
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#333'
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const buttonStyles: React.CSSProperties = {
    padding: '10px 20px',
    marginLeft: '10px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px'
  };

  return createPortal(
    <div style={modalStyles} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={contentStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name} style={fieldStyles}>
              <label style={labelStyles}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  style={inputStyles}
                >
                  <option value="">Selecciona...</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  style={inputStyles}
                />
              )}
            </div>
          ))}
          
          {error && (
            <div style={{ 
              color: '#dc3545', 
              backgroundColor: '#f8d7da', 
              padding: '8px 12px', 
              borderRadius: '4px', 
              marginBottom: '16px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                ...buttonStyles, 
                backgroundColor: '#6c757d', 
                color: 'white' 
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              style={{ 
                ...buttonStyles, 
                backgroundColor: '#007bff', 
                color: 'white' 
              }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
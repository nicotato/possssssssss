import React, { useState, useEffect } from 'react';
import { TaxService, TaxType } from '../../application/services/tax-service.ts';
import { useAppState } from '../AppContext.tsx';

interface TaxFormData {
  code: string;
  name: string;
  rate: number; // Como porcentaje (ej: 21 para 21%)
  scope: 'line' | 'global';
  appliesToCategories: string[];
  active: boolean;
}

interface TaxManagementPageProps {}

export function TaxManagementPage({}: TaxManagementPageProps) {
  const { services } = useAppState();
  const [taxes, setTaxes] = useState<TaxType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxType | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [formData, setFormData] = useState<TaxFormData>({
    code: '',
    name: '',
    rate: 0,
    scope: 'line',
    appliesToCategories: [],
    active: true
  });

  useEffect(() => {
    loadTaxes();
  }, []);

  const loadTaxes = async () => {
    try {
      setIsLoading(true);
      const allTaxes = await services.tax.getAllTaxes();
      setTaxes(allTaxes);
    } catch (error) {
      console.error('Error loading taxes:', error);
      setStatus({ type: 'error', message: 'Error al cargar impuestos' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      rate: 0,
      scope: 'line',
      appliesToCategories: [],
      active: true
    });
    setEditingTax(null);
    setShowForm(false);
  };

  const handleInputChange = (field: keyof TaxFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTax) {
        await services.tax.updateTax(editingTax.id, {
          ...formData,
          rate: formData.rate // El servicio ya maneja la conversión a decimal
        });
        setStatus({ type: 'success', message: 'Impuesto actualizado correctamente' });
      } else {
        await services.tax.createTax(formData);
        setStatus({ type: 'success', message: 'Impuesto creado correctamente' });
      }
      
      resetForm();
      loadTaxes();
    } catch (error) {
      console.error('Error saving tax:', error);
      setStatus({ type: 'error', message: 'Error al guardar impuesto' });
    }

    setTimeout(() => setStatus(null), 3000);
  };

  const handleEdit = (tax: TaxType) => {
    setFormData({
      code: tax.code,
      name: tax.name,
      rate: tax.rate * 100, // Convertir de decimal a porcentaje para mostrar
      scope: tax.scope,
      appliesToCategories: tax.appliesToCategories,
      active: tax.active
    });
    setEditingTax(tax);
    setShowForm(true);
  };

  const handleDelete = async (tax: TaxType) => {
    if (!confirm(`¿Estás seguro de que deseas desactivar el impuesto "${tax.name}"?`)) {
      return;
    }

    try {
      await services.tax.deleteTax(tax.id);
      setStatus({ type: 'success', message: 'Impuesto desactivado correctamente' });
      loadTaxes();
    } catch (error) {
      console.error('Error deleting tax:', error);
      setStatus({ type: 'error', message: 'Error al desactivar impuesto' });
    }

    setTimeout(() => setStatus(null), 3000);
  };

  const handleReactivate = async (tax: TaxType) => {
    if (!confirm(`¿Deseas reactivar el impuesto "${tax.name}"?`)) {
      return;
    }

    try {
      await services.tax.updateTax(tax.id, { active: true });
      setStatus({ type: 'success', message: 'Impuesto reactivado correctamente' });
      loadTaxes();
    } catch (error) {
      console.error('Error reactivating tax:', error);
      setStatus({ type: 'error', message: 'Error al reactivar impuesto' });
    }

    setTimeout(() => setStatus(null), 3000);
  };

  const handlePermanentDelete = async (tax: TaxType) => {
    if (!confirm(`¿Estás seguro de que deseas BORRAR PERMANENTEMENTE el impuesto "${tax.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await services.tax.permanentlyDeleteTax(tax.id);
      setStatus({ type: 'success', message: 'Impuesto borrado permanentemente' });
      loadTaxes();
    } catch (error) {
      console.error('Error permanently deleting tax:', error);
      setStatus({ type: 'error', message: 'Error al borrar impuesto permanentemente' });
    }

    setTimeout(() => setStatus(null), 3000);
  };

  const createDefaultTaxes = async () => {
    try {
      await services.tax.createDefaultTaxes();
      setStatus({ type: 'success', message: 'Impuestos predeterminados creados' });
      loadTaxes();
    } catch (error) {
      console.error('Error creating default taxes:', error);
      setStatus({ type: 'error', message: 'Error al crear impuestos predeterminados' });
    }

    setTimeout(() => setStatus(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>🧾 Gestión de Impuestos</h1>
        </div>
        <div className="loading">Cargando impuestos...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>🧾 Gestión de Impuestos</h1>
        <div className="page-actions">
          {taxes.length === 0 && (
            <button className="btn btn-secondary" onClick={createDefaultTaxes}>
              ➕ Crear Impuestos Predeterminados
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(true)}
          >
            ➕ Nuevo Impuesto
          </button>
        </div>
      </div>

      {status && (
        <div className={`status-message status-${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="content-grid">
        {/* Lista de Impuestos */}
        <div className="tax-list">
          <h2>Impuestos Configurados</h2>
          
          {taxes.length === 0 ? (
            <div className="empty-state">
              <p>No hay impuestos configurados.</p>
              <p>Puedes crear impuestos predeterminados para Argentina o agregar uno personalizado.</p>
            </div>
          ) : (
            <div className="tax-cards">
              {taxes.map(tax => (
                <div 
                  key={tax.id} 
                  className={`tax-card ${!tax.active ? 'tax-card--inactive' : ''}`}
                >
                  <div className="tax-card__header">
                    <div className="tax-card__title">
                      <strong>{tax.code}</strong>
                      <span className={`tax-status ${tax.active ? 'active' : 'inactive'}`}>
                        {tax.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="tax-card__actions">
                      <button 
                        className="btn btn-small btn-outline"
                        onClick={() => handleEdit(tax)}
                        title="Editar impuesto"
                      >
                        ✏️
                      </button>
                      {tax.active ? (
                        <button 
                          className="btn btn-small btn-warning"
                          onClick={() => handleDelete(tax)}
                          title="Desactivar impuesto"
                        >
                          ⏸️
                        </button>
                      ) : (
                        <button 
                          className="btn btn-small btn-success"
                          onClick={() => handleReactivate(tax)}
                          title="Reactivar impuesto"
                        >
                          ▶️
                        </button>
                      )}
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => handlePermanentDelete(tax)}
                        title="Borrar permanentemente"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="tax-card__content">
                    <p><strong>{tax.name}</strong></p>
                    <div className="tax-details">
                      <span className="tax-rate">{(tax.rate * 100).toFixed(2)}%</span>
                      <span className="tax-scope">
                        {tax.scope === 'line' ? '📋 Por línea' : '🌐 Global'}
                      </span>
                    </div>
                    
                    {tax.appliesToCategories.length > 0 && (
                      <div className="tax-categories">
                        <small>Categorías: {tax.appliesToCategories.join(', ')}</small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="tax-form-overlay">
            <div className="tax-form-modal">
              <div className="modal-header">
                <h2>{editingTax ? 'Editar Impuesto' : 'Nuevo Impuesto'}</h2>
                <button 
                  className="btn btn-text" 
                  onClick={resetForm}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="tax-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Código *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="ej: IVA21"
                      required
                      maxLength={10}
                    />
                    <small>Código único para identificar el impuesto</small>
                  </div>

                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="ej: IVA 21%"
                      required
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tasa (%) *</label>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                      placeholder="21"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                    <small>Porcentaje del impuesto (ej: 21 para 21%)</small>
                  </div>

                  <div className="form-group">
                    <label>Ámbito *</label>
                    <select
                      value={formData.scope}
                      onChange={(e) => handleInputChange('scope', e.target.value as 'line' | 'global')}
                    >
                      <option value="line">Por línea</option>
                      <option value="global">Global (sobre subtotal)</option>
                    </select>
                    <small>Por línea: se aplica a cada producto. Global: se aplica al total</small>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      id="taxActive"
                      checked={formData.active}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                      className="checkbox-input"
                    />
                    <label htmlFor="taxActive" className="checkbox-label">
                      <span className="checkbox-custom"></span>
                      <span className="checkbox-text">Impuesto activo</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTax ? 'Actualizar' : 'Crear'} Impuesto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
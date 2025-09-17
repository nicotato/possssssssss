import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppContext.tsx';

interface Promotion {
  id: string;
  name: string;
  type: 'BUY_X_GET_Y' | 'SECOND_DISCOUNT' | 'COMBO_FIXED' | 'PERCENT_CART' | 'CUSTOM';
  active: boolean;
  priority?: number;
  stackable?: boolean;
  excludes?: string[];
  config?: Record<string, any>;
  appliesToBranchIds?: string[];
  validFrom?: string;
  validTo?: string;
  logic?: Record<string, any>;
  dsl?: string;
}

const PromotionsPage: React.FC = () => {
  const { services, repos } = useAppState();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Formulario state
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: '',
    type: 'PERCENT_CART',
    active: true,
    priority: 0,
    stackable: true,
    config: {},
    dsl: ''
  });

  // Cargar promociones
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        if (repos?.promotions?.col) {
          const docs = await repos.promotions.col.find().sort('-priority').exec();
          const promoList = docs.map((doc: any) => doc.toJSON());
          setPromotions(promoList);
        }
      } catch (err) {
        console.error('Error loading promotions:', err);
        setError('Error al cargar promociones');
      }
    };

    loadPromotions();
  }, [repos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      setError('Por favor complete los campos obligatorios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingPromo) {
        // Actualizar promoción existente
        if (repos?.promotions?.col) {
          const doc = await repos.promotions.col.findOne(editingPromo.id).exec();
          if (doc) {
            await doc.incrementalPatch(formData);
          }
        }
      } else {
        // Crear nueva promoción
        if (repos?.promotions?.col) {
          const newPromo = {
            ...formData,
            id: `promo_${Date.now()}`,
          };
          await repos.promotions.col.insert(newPromo);
        }
      }

      // Recargar lista
      if (repos?.promotions?.col) {
        const docs = await repos.promotions.col.find().sort('-priority').exec();
        const promoList = docs.map((doc: any) => doc.toJSON());
        setPromotions(promoList);
      }

      // Limpiar formulario
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al guardar promoción');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormData({ ...promo });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta promoción?')) return;

    try {
      if (repos?.promotions?.col) {
        const doc = await repos.promotions.col.findOne(id).exec();
        if (doc) {
          await doc.remove();
          setPromotions(promos => promos.filter(p => p.id !== id));
        }
      }
    } catch (err) {
      setError('Error al eliminar promoción');
    }
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      if (repos?.promotions?.col) {
        const doc = await repos.promotions.col.findOne(promo.id).exec();
        if (doc) {
          await doc.incrementalPatch({ active: !promo.active });
          setPromotions(promos => 
            promos.map(p => p.id === promo.id ? { ...p, active: !p.active } : p)
          );
        }
      }
    } catch (err) {
      setError('Error al cambiar estado de promoción');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'PERCENT_CART',
      active: true,
      priority: 0,
      stackable: true,
      config: {},
      dsl: ''
    });
    setEditingPromo(null);
    setShowForm(false);
    setError('');
  };

  const getTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'BUY_X_GET_Y': 'Compra X Lleva Y',
      'SECOND_DISCOUNT': 'Descuento Segunda Unidad',
      'COMBO_FIXED': 'Combo Precio Fijo',
      'PERCENT_CART': 'Descuento % Carrito',
      'CUSTOM': 'Personalizada'
    };
    return types[type] || type;
  };

  return (
    <div className="promotions-page">
      <div className="page-header">
        <h1>🎁 Promociones</h1>
        <p>Gestión de promociones y ofertas especiales</p>
        <button 
          className="btn btn--primary"
          onClick={() => setShowForm(true)}
        >
          + Nueva Promoción
        </button>
      </div>

      {error && (
        <div className="alert alert--danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
              <button className="modal__close" onClick={resetForm}>×</button>
            </div>
            <div className="modal__body">
              <form onSubmit={handleSubmit} className="form">
                <div className="form__group">
                  <label className="form__label">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form__input"
                    placeholder="Ej: 2x1 en pizzas familiares"
                    required
                  />
                </div>

                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label">Tipo *</label>
                    <select
                      value={formData.type || 'PERCENT_CART'}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="form__select"
                      required
                    >
                      <option value="PERCENT_CART">Descuento % Carrito</option>
                      <option value="BUY_X_GET_Y">Compra X Lleva Y</option>
                      <option value="SECOND_DISCOUNT">Descuento 2da Unidad</option>
                      <option value="COMBO_FIXED">Combo Precio Fijo</option>
                      <option value="CUSTOM">Personalizada</option>
                    </select>
                  </div>

                  <div className="form__group">
                    <label className="form__label">Prioridad</label>
                    <input
                      type="number"
                      value={formData.priority || 0}
                      onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                      className="form__input"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="form__row">
                  <div className="form__group">
                    <label className="form__checkbox">
                      <input
                        type="checkbox"
                        checked={formData.active || false}
                        onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      />
                      Activa
                    </label>
                  </div>

                  <div className="form__group">
                    <label className="form__checkbox">
                      <input
                        type="checkbox"
                        checked={formData.stackable || false}
                        onChange={(e) => setFormData({...formData, stackable: e.target.checked})}
                      />
                      Apilable con otras promociones
                    </label>
                  </div>
                </div>

                <div className="form__group">
                  <label className="form__label">DSL/Lógica personalizada</label>
                  <textarea
                    value={formData.dsl || ''}
                    onChange={(e) => setFormData({...formData, dsl: e.target.value})}
                    className="form__textarea"
                    placeholder="Ej: if cartTotal > 1000 then discountPercent 10"
                    rows={4}
                  />
                  <small className="form__help">
                    Sintaxis DSL personalizada o deje vacío para usar configuración básica
                  </small>
                </div>

                <div className="form__actions">
                  <button type="button" className="btn btn--secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={loading}>
                    {loading ? 'Guardando...' : (editingPromo ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Promociones */}
      <div className="card">
        <div className="card__header">
          <h2>Promociones Configuradas</h2>
        </div>
        <div className="card__body">
          {promotions.length === 0 ? (
            <div className="empty-state">
              <p>No hay promociones configuradas aún</p>
              <button className="btn btn--primary" onClick={() => setShowForm(true)}>
                Crear primera promoción
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Apilable</th>
                    <th>DSL</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo) => (
                    <tr key={promo.id}>
                      <td>
                        <strong>{promo.name}</strong>
                      </td>
                      <td>
                        <span className="badge badge--info">
                          {getTypeDisplay(promo.type)}
                        </span>
                      </td>
                      <td>{promo.priority || 0}</td>
                      <td>
                        <button
                          className={`badge badge--${promo.active ? 'success' : 'secondary'}`}
                          onClick={() => toggleActive(promo)}
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          {promo.active ? 'Activa' : 'Inactiva'}
                        </button>
                      </td>
                      <td>{promo.stackable ? '✅' : '❌'}</td>
                      <td>
                        {promo.dsl ? (
                          <span title={promo.dsl} className="badge badge--warning">
                            DSL
                          </span>
                        ) : (
                          <span className="text-muted">Básica</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn--small btn--secondary"
                            onClick={() => handleEdit(promo)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn--small btn--danger"
                            onClick={() => handleDelete(promo.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;

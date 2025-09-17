import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppContext.tsx';

interface PriceExperiment {
  id: string;
  productId: string;
  createdAt: string;
  base: {
    price: number;
    quantity: number;
    elasticity: number;
  };
  scenarios: {
    id: string;
    price: number;
    estQuantity: number;
    estRevenue: number;
  }[];
  modelVersion?: string;
  tags?: string[];
  notes?: string;
  user?: string;
}

interface Product {
  id: string;
  name: string;
  sellPrice?: number;
  price?: number;
}

const PriceExperimentsPage: React.FC = () => {
  const { services, repos } = useAppState();
  const [experiments, setExperiments] = useState<PriceExperiment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Formulario state
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [basePrice, setBasePrice] = useState<string>('');
  const [baseQuantity, setBaseQuantity] = useState<string>('');
  const [elasticity, setElasticity] = useState<string>('-1.5');
  const [priceVariations, setPriceVariations] = useState<number[]>([0.8, 0.9, 1.1, 1.2, 1.5]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [repos]);

  const loadData = async () => {
    try {
      // Cargar productos
      if (repos?.products?.col) {
        const productDocs = await repos.products.col.find().limit(100).exec();
        setProducts(productDocs.map((doc: any) => doc.toJSON()));
      }

      // Cargar experimentos existentes
      if (repos?.priceExperiments?.col) {
        const experimentDocs = await repos.priceExperiments.col.find().sort('-createdAt').limit(50).exec();
        setExperiments(experimentDocs.map((doc: any) => doc.toJSON()));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar datos');
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      const price = product.sellPrice || product.price || 0;
      setBasePrice(price.toString());
    }
  };

  const calculateScenarios = (price: number, quantity: number, elasticity: number) => {
    return priceVariations.map((multiplier, index) => {
      const newPrice = price * multiplier;
      const priceChangePercent = (newPrice - price) / price;
      const quantityChangePercent = elasticity * priceChangePercent;
      const estQuantity = Math.max(0, quantity * (1 + quantityChangePercent));
      const estRevenue = newPrice * estQuantity;

      return {
        id: `scenario_${index}`,
        price: newPrice,
        estQuantity: Math.round(estQuantity * 100) / 100,
        estRevenue: Math.round(estRevenue * 100) / 100
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !basePrice || !baseQuantity || !elasticity) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    const price = parseFloat(basePrice);
    const quantity = parseFloat(baseQuantity);
    const elastic = parseFloat(elasticity);

    if (isNaN(price) || isNaN(quantity) || isNaN(elastic) || price <= 0 || quantity <= 0) {
      setError('Por favor ingrese valores numéricos válidos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const base = { price, quantity, elasticity: elastic };
      const scenarios = calculateScenarios(price, quantity, elastic);

      if (services?.priceExperiments?.recordExperiment) {
        await services.priceExperiments.recordExperiment({
          productId: selectedProduct,
          scenarios,
          base
        });

        // Recargar experimentos
        await loadData();

        // Reset form
        resetForm();
      } else {
        setError('Servicio de experimentos no disponible');
      }

    } catch (err: any) {
      setError(err.message || 'Error al crear experimento');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct('');
    setBasePrice('');
    setBaseQuantity('');
    setElasticity('-1.5');
    setNotes('');
    setShowForm(false);
    setError('');
  };

  const addPriceVariation = () => {
    setPriceVariations([...priceVariations, 1.0]);
  };

  const updatePriceVariation = (index: number, value: number) => {
    const updated = [...priceVariations];
    updated[index] = value;
    setPriceVariations(updated);
  };

  const removePriceVariation = (index: number) => {
    setPriceVariations(priceVariations.filter((_, i) => i !== index));
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Producto desconocido';
  };

  return (
    <div className="price-experiments-page">
      <div className="page-header">
        <h1>📊 Experimentos de Precios</h1>
        <p>Análisis de elasticidad de precios y proyecciones de demanda</p>
        <button 
          className="btn btn--primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Experimento
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
          <div className="modal modal--large" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Nuevo Experimento de Precios</h2>
              <button className="modal__close" onClick={resetForm}>×</button>
            </div>
            <div className="modal__body">
              <form onSubmit={handleSubmit} className="form">
                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label">Producto *</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="form__select"
                      required
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.sellPrice || product.price || 0}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label">Precio Base Actual *</label>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="form__input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form__group">
                    <label className="form__label">Cantidad Base (mensual) *</label>
                    <input
                      type="number"
                      value={baseQuantity}
                      onChange={(e) => setBaseQuantity(e.target.value)}
                      className="form__input"
                      placeholder="100"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form__group">
                    <label className="form__label">Elasticidad de Precios *</label>
                    <input
                      type="number"
                      value={elasticity}
                      onChange={(e) => setElasticity(e.target.value)}
                      className="form__input"
                      placeholder="-1.5"
                      step="0.1"
                      required
                    />
                    <small className="form__help">
                      Valores típicos: -0.5 (inelástico) a -2.5 (muy elástico)
                    </small>
                  </div>
                </div>

                <div className="form__group">
                  <label className="form__label">Variaciones de Precio (multiplicadores)</label>
                  <div className="price-variations">
                    {priceVariations.map((variation, index) => (
                      <div key={index} className="variation-row">
                        <input
                          type="number"
                          value={variation}
                          onChange={(e) => updatePriceVariation(index, parseFloat(e.target.value) || 1)}
                          className="form__input form__input--small"
                          min="0.1"
                          max="10"
                          step="0.1"
                        />
                        <span className="variation-preview">
                          ${basePrice ? (parseFloat(basePrice) * variation).toFixed(2) : '0.00'}
                        </span>
                        <button
                          type="button"
                          className="btn btn--danger btn--small"
                          onClick={() => removePriceVariation(index)}
                          disabled={priceVariations.length <= 1}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn--secondary btn--small"
                      onClick={addPriceVariation}
                    >
                      + Agregar Variación
                    </button>
                  </div>
                </div>

                <div className="form__group">
                  <label className="form__label">Notas</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form__textarea"
                    placeholder="Contexto del experimento, supuestos, etc."
                    rows={3}
                  />
                </div>

                <div className="form__actions">
                  <button type="button" className="btn btn--secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Experimento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Experimentos */}
      <div className="card">
        <div className="card__header">
          <h2>Experimentos Registrados</h2>
        </div>
        <div className="card__body">
          {experiments.length === 0 ? (
            <div className="empty-state">
              <p>No hay experimentos de precios registrados aún</p>
              <button className="btn btn--primary" onClick={() => setShowForm(true)}>
                Crear primer experimento
              </button>
            </div>
          ) : (
            <div className="experiments-grid">
              {experiments.map((experiment) => (
                <div key={experiment.id} className="experiment-card">
                  <div className="experiment-header">
                    <h3>{getProductName(experiment.productId)}</h3>
                    <span className="experiment-date">
                      {new Date(experiment.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <div className="experiment-base">
                    <div className="base-metrics">
                      <div className="metric">
                        <label>Precio Base</label>
                        <div className="metric-value">${experiment.base.price}</div>
                      </div>
                      <div className="metric">
                        <label>Cantidad Base</label>
                        <div className="metric-value">{experiment.base.quantity}</div>
                      </div>
                      <div className="metric">
                        <label>Elasticidad</label>
                        <div className="metric-value">{experiment.base.elasticity}</div>
                      </div>
                    </div>
                  </div>

                  <div className="experiment-scenarios">
                    <h4>Escenarios de Precio</h4>
                    <div className="scenarios-table">
                      <table className="table table--compact">
                        <thead>
                          <tr>
                            <th>Precio</th>
                            <th>Cantidad Est.</th>
                            <th>Ingresos Est.</th>
                            <th>Cambio %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {experiment.scenarios.map((scenario) => {
                            const priceChange = ((scenario.price - experiment.base.price) / experiment.base.price * 100);
                            const revenueChange = ((scenario.estRevenue - (experiment.base.price * experiment.base.quantity)) / (experiment.base.price * experiment.base.quantity) * 100);
                            
                            return (
                              <tr key={scenario.id} className={revenueChange > 0 ? 'positive-change' : revenueChange < 0 ? 'negative-change' : ''}>
                                <td>${scenario.price.toFixed(2)}</td>
                                <td>{scenario.estQuantity}</td>
                                <td>${scenario.estRevenue.toFixed(2)}</td>
                                <td>
                                  <span className={`change-indicator ${revenueChange > 0 ? 'positive' : revenueChange < 0 ? 'negative' : 'neutral'}`}>
                                    {revenueChange > 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {experiment.notes && (
                    <div className="experiment-notes">
                      <h4>Notas</h4>
                      <p>{experiment.notes}</p>
                    </div>
                  )}

                  <div className="experiment-meta">
                    <small>
                      Por: {experiment.user || 'Sistema'} | 
                      Modelo: {experiment.modelVersion || 'v1'} |
                      ID: {experiment.id}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceExperimentsPage;

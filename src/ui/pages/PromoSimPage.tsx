import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppContext.tsx';

interface SimulationScenario {
  id: string;
  name: string;
  params: {
    lines: any[];
    discounts?: any[];
    branchId?: string;
    customerType?: string;
  };
}

interface SimulationResult {
  scenario: SimulationScenario;
  result: {
    subTotal: number;
    discountTotal: number;
    taxTotal: number;
    total: number;
    appliedPromotions: any[];
    costVarianceBase?: number;
    error?: string;
  };
}

const PromoSimPage: React.FC = () => {
  const { services, repos } = useAppState();
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Formulario para nuevo escenario
  const [showForm, setShowForm] = useState<boolean>(false);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; qty: number; price: number }[]>([]);

  useEffect(() => {
    loadData();
  }, [repos]);

  const loadData = async () => {
    try {
      // Cargar productos
      if (repos?.products?.col) {
        const productDocs = await repos.products.col.find().limit(50).exec();
        setProducts(productDocs.map((doc: any) => doc.toJSON()));
      }

      // Cargar promociones activas
      if (repos?.promotions?.active) {
        const activePromos = await repos.promotions.active('main');
        setPromotions(activePromos);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar datos');
    }
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', qty: 1, price: 0 }]);
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-fill price when product is selected
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].price = product.sellPrice || product.price || 0;
      }
    }
    
    setSelectedProducts(updated);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const createScenario = () => {
    if (!scenarioName.trim()) {
      setError('Por favor ingrese un nombre para el escenario');
      return;
    }

    if (selectedProducts.length === 0 || selectedProducts.some(p => !p.productId)) {
      setError('Por favor agregue al menos un producto válido');
      return;
    }

    // Convertir productos seleccionados a formato de líneas
    const lines = selectedProducts.map((sp, index) => {
      const product = products.find(p => p.id === sp.productId);
      return {
        id: `line_${index}`,
        productId: sp.productId,
        name: product?.name || 'Producto',
        category: product?.category || 'General',
        qty: sp.qty,
        unitPrice: sp.price,
        lineTotal: sp.qty * sp.price
      };
    });

    const newScenario: SimulationScenario = {
      id: `scenario_${Date.now()}`,
      name: scenarioName,
      params: {
        lines,
        branchId: 'main'
      }
    };

    setScenarios([...scenarios, newScenario]);
    
    // Reset form
    setScenarioName('');
    setSelectedProducts([]);
    setShowForm(false);
    setError('');
  };

  const runSimulation = async () => {
    if (scenarios.length === 0) {
      setError('No hay escenarios para simular');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Usar worker si está disponible, sino simular localmente
      const simulationResults: SimulationResult[] = [];

      for (const scenario of scenarios) {
        try {
          // Simulación simplificada local usando los servicios
          let result = {
            subTotal: 0,
            discountTotal: 0,
            taxTotal: 0,
            total: 0,
            appliedPromotions: [] as any[]
          };

          // Calcular subtotal
          result.subTotal = scenario.params.lines.reduce((sum, line) => sum + line.lineTotal, 0);

          // Aplicar promociones si el servicio está disponible
          if (services?.promotions?.applyPromotions) {
            const promoResult = await services.promotions.applyPromotions(
              scenario.params.lines, 
              promotions // usar las promociones cargadas
            );
            result.appliedPromotions = promoResult.appliedPromotions;
            result.discountTotal = promoResult.promotionDiscountTotal || 0;
          }

          // Calcular impuestos si el servicio está disponible
          if (services?.tax?.calculate) {
            const taxResult = await services.tax.calculate(scenario.params.lines);
            result.taxTotal = Array.isArray(taxResult) ? taxResult.reduce((sum, tax) => sum + tax.amount, 0) : 0;
          } else {
            result.taxTotal = 0;
          }

          result.total = result.subTotal - result.discountTotal + result.taxTotal;

          simulationResults.push({
            scenario,
            result
          });

        } catch (err: any) {
          simulationResults.push({
            scenario,
            result: {
              subTotal: 0,
              discountTotal: 0,
              taxTotal: 0,
              total: 0,
              appliedPromotions: [],
              error: err.message || 'Error en simulación'
            }
          });
        }
      }

      setResults(simulationResults);

    } catch (err: any) {
      setError(err.message || 'Error en simulación');
    } finally {
      setLoading(false);
    }
  };

  const clearScenarios = () => {
    setScenarios([]);
    setResults([]);
  };

  return (
    <div className="promo-sim-page">
      <div className="page-header">
        <h1>🎯 Simulación de Promociones</h1>
        <p>Pruebe diferentes escenarios para evaluar el impacto de sus promociones</p>
      </div>

      {error && (
        <div className="alert alert--danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="promo-sim-content">
        {/* Panel de Control */}
        <div className="card">
          <div className="card__header">
            <h2>Panel de Control</h2>
            <div className="btn-group">
              <button 
                className="btn btn--primary"
                onClick={() => setShowForm(true)}
              >
                + Nuevo Escenario
              </button>
              <button 
                className="btn btn--success"
                onClick={runSimulation}
                disabled={loading || scenarios.length === 0}
              >
                {loading ? 'Simulando...' : '▶️ Ejecutar Simulación'}
              </button>
              <button 
                className="btn btn--secondary"
                onClick={clearScenarios}
                disabled={scenarios.length === 0}
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>
          <div className="card__body">
            <div className="stats-grid">
              <div className="stat">
                <div className="stat__label">Promociones Activas</div>
                <div className="stat__value">{promotions.length}</div>
              </div>
              <div className="stat">
                <div className="stat__label">Escenarios</div>
                <div className="stat__value">{scenarios.length}</div>
              </div>
              <div className="stat">
                <div className="stat__label">Productos Disponibles</div>
                <div className="stat__value">{products.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Escenario */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal modal--large" onClick={e => e.stopPropagation()}>
              <div className="modal__header">
                <h2>Nuevo Escenario de Simulación</h2>
                <button className="modal__close" onClick={() => setShowForm(false)}>×</button>
              </div>
              <div className="modal__body">
                <form onSubmit={(e) => { e.preventDefault(); createScenario(); }}>
                  <div className="form__group">
                    <label className="form__label">Nombre del Escenario *</label>
                    <input
                      type="text"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                      className="form__input"
                      placeholder="Ej: Carrito típico familia"
                      required
                    />
                  </div>

                  <div className="form__group">
                    <label className="form__label">Productos en el Carrito</label>
                    <div className="product-selector">
                      {selectedProducts.map((sp, index) => (
                        <div key={index} className="product-row">
                          <select
                            value={sp.productId}
                            onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                            className="form__select"
                          >
                            <option value="">Seleccionar producto...</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} - ${product.sellPrice || product.price || 0}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={sp.qty}
                            onChange={(e) => updateProduct(index, 'qty', parseInt(e.target.value) || 1)}
                            className="form__input form__input--small"
                            min="1"
                            placeholder="Cant"
                          />
                          <input
                            type="number"
                            value={sp.price}
                            onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                            className="form__input form__input--small"
                            min="0"
                            step="0.01"
                            placeholder="Precio"
                          />
                          <button
                            type="button"
                            className="btn btn--danger btn--small"
                            onClick={() => removeProduct(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn--secondary btn--small"
                        onClick={addProduct}
                      >
                        + Agregar Producto
                      </button>
                    </div>
                  </div>

                  <div className="form__actions">
                    <button type="button" className="btn btn--secondary" onClick={() => setShowForm(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn--primary">
                      Crear Escenario
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Escenarios */}
        {scenarios.length > 0 && (
          <div className="card">
            <div className="card__header">
              <h2>Escenarios Configurados</h2>
            </div>
            <div className="card__body">
              <div className="scenarios-grid">
                {scenarios.map(scenario => (
                  <div key={scenario.id} className="scenario-card">
                    <h3>{scenario.name}</h3>
                    <div className="scenario-details">
                      <p><strong>Productos:</strong> {scenario.params.lines.length}</p>
                      <p><strong>Subtotal:</strong> ${scenario.params.lines.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2)}</p>
                    </div>
                    <div className="scenario-products">
                      {scenario.params.lines.map((line, index) => (
                        <div key={index} className="product-line">
                          {line.qty}x {line.name} @ ${line.unitPrice}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {results.length > 0 && (
          <div className="card">
            <div className="card__header">
              <h2>Resultados de Simulación</h2>
            </div>
            <div className="card__body">
              <div className="results-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Escenario</th>
                      <th>Subtotal</th>
                      <th>Descuentos</th>
                      <th>Impuestos</th>
                      <th>Total</th>
                      <th>Promociones Aplicadas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className={result.result.error ? 'error-row' : ''}>
                        <td><strong>{result.scenario.name}</strong></td>
                        <td>${result.result.subTotal.toFixed(2)}</td>
                        <td className="discount-amount">
                          -${result.result.discountTotal.toFixed(2)}
                        </td>
                        <td>${result.result.taxTotal.toFixed(2)}</td>
                        <td><strong>${result.result.total.toFixed(2)}</strong></td>
                        <td>
                          {result.result.error ? (
                            <span className="error-text">{result.result.error}</span>
                          ) : result.result.appliedPromotions.length > 0 ? (
                            <ul className="promo-list">
                              {result.result.appliedPromotions.map((promo, i) => (
                                <li key={i}>{promo.description} (-${promo.discountAmount.toFixed(2)})</li>
                              ))}
                            </ul>
                          ) : (
                            <em>Ninguna</em>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoSimPage;

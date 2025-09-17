import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppContext.tsx';

interface WasteRecord {
  id: string;
  ingredientId: string;
  ingredientName?: string;
  qty: number;
  reason: string;
  branchId: string;
  reportedBy: string;
  timestamp: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  current?: number;
}

const WastePage: React.FC = () => {
  const { services, repos } = useAppState();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [qty, setQty] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Cargar ingredientes al montar
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        if (repos?.ingredients?.col) {
          const docs = await repos.ingredients.col.find().exec();
          const ingredientsList = docs.map((doc: any) => ({
            id: doc.get('id'),
            name: doc.get('name'),
            unit: doc.get('unit'),
            current: doc.get('current') || 0
          }));
          setIngredients(ingredientsList);
        }
      } catch (err) {
        console.error('Error loading ingredients:', err);
        setError('Error al cargar ingredientes');
      }
    };

    const loadWasteRecords = async () => {
      try {
        if (repos?.waste?.col) {
          const docs = await repos.waste.col.find().sort('-timestamp').limit(50).exec();
          const records = docs.map((doc: any) => doc.toJSON());
          
          // Enriquecer con nombre de ingrediente
          const enriched = records.map((record: any) => {
            const ingredient = ingredients.find(ing => ing.id === record.ingredientId);
            return {
              ...record,
              ingredientName: ingredient?.name || 'Ingrediente desconocido'
            };
          });
          setWasteRecords(enriched);
        }
      } catch (err) {
        console.error('Error loading waste records:', err);
      }
    };

    loadIngredients();
    if (ingredients.length > 0) {
      loadWasteRecords();
    }
  }, [repos, ingredients.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || !qty || parseFloat(qty) <= 0) {
      setError('Por favor complete todos los campos con valores válidos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (services?.waste) {
        const result = await services.waste.reportWaste({
          ingredientId: selectedIngredient,
          qty: parseFloat(qty),
          reason,
          notes: ''
        });

        // Limpiar formulario
        setSelectedIngredient('');
        setQty('');
        setReason('');

        // Recargar registros
        window.location.reload(); // Simple refresh for now
      }
    } catch (err: any) {
      setError(err.message || 'Error al reportar merma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="waste-page">
      <div className="page-header">
        <h1>🗑️ Gestión de Merma</h1>
        <p>Reporte y seguimiento de merma de ingredientes</p>
      </div>

      {error && (
        <div className="alert alert--danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="waste-content">
        {/* Formulario de Reporte */}
        <div className="card">
          <div className="card__header">
            <h2>Reportar Merma</h2>
          </div>
          <div className="card__body">
            <form onSubmit={handleSubmit} className="form">
              <div className="form__group">
                <label htmlFor="ingredient" className="form__label">
                  Ingrediente *
                </label>
                <select
                  id="ingredient"
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="form__select"
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar ingrediente...</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit}) - Stock: {ing.current || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form__group">
                <label htmlFor="qty" className="form__label">
                  Cantidad *
                </label>
                <input
                  type="number"
                  id="qty"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="form__input"
                  placeholder="Cantidad de merma"
                  min="0.01"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form__group">
                <label htmlFor="reason" className="form__label">
                  Motivo
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="form__textarea"
                  placeholder="Motivo de la merma (opcional)"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="form__actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading || !selectedIngredient || !qty}
                >
                  {loading ? 'Reportando...' : 'Reportar Merma'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Historial de Merma */}
        <div className="card">
          <div className="card__header">
            <h2>Historial de Merma</h2>
          </div>
          <div className="card__body">
            {wasteRecords.length === 0 ? (
              <div className="empty-state">
                <p>No hay registros de merma aún</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Ingrediente</th>
                      <th>Cantidad</th>
                      <th>Motivo</th>
                      <th>Reportado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteRecords.map((record) => (
                      <tr key={record.id}>
                        <td>
                          {new Date(record.timestamp).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <strong>{record.ingredientName}</strong>
                        </td>
                        <td>
                          <span className="quantity-badge">
                            {record.qty}
                          </span>
                        </td>
                        <td>
                          {record.reason || <em>Sin especificar</em>}
                        </td>
                        <td>{record.reportedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WastePage;

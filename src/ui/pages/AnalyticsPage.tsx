import React, { useState } from 'react';
import { useServices } from '../hooks/useServices.js';
import { useAuth } from '../hooks/useAuth.js';

const AnalyticsPage: React.FC = () => {
  const { analytics: analyticsService } = useServices();
  const { hasPermission } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!hasPermission('ANALYTICS_VIEW')) {
    return (
      <div>
        <h1>Analytics</h1>
        <p>No autorizado.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!from || !to) {
      setError('Seleccione fechas.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fromIso = new Date(`${from}T00:00:00`).toISOString();
      const toIso = new Date(`${to}T23:59:59`).toISOString();
      const [summary, best, notSold, customers] = await Promise.all([
        analyticsService.salesSummary(fromIso, toIso),
        analyticsService.bestSellers(fromIso, toIso, 5),
        analyticsService.notSoldProducts(fromIso, toIso),
        analyticsService.customerPerformance(fromIso, toIso),
      ]);
      setResults({ summary, best, notSold, customers });
    } catch (err: any) {
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Analítica</h2>
      <div className="form-group" style={{ maxWidth: '600px' }}>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generando...' : 'Generar'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Resumen</h3>
          <p>
            Ventas: {results.summary.count} | Total: ${results.summary.total.toFixed(2)} | Ticket Prom: $
            {results.summary.avgTicket.toFixed(2)} | Impuestos: ${results.summary.tax.toFixed(2)} | Propinas: $
            {results.summary.tip.toFixed(2)}
          </p>
          <h3>Top 5 Productos</h3>
          <ul>
            {results.best.map((p: any) => (
              <li key={p.name}>
                {p.name} - Cant: {p.qty} - ${p.revenue.toFixed(2)}
              </li>
            ))}
          </ul>
          <h3>No Vendidos</h3>
          <p>{results.notSold.length} productos sin ventas en el periodo.</p>
          <details>
            <summary>Ver lista</summary>
            <ul>
              {results.notSold.map((p: any) => (
                <li key={p.name}>{p.name}</li>
              ))}
            </ul>
          </details>
          <h3>Clientes (Top por total)</h3>
          <ul>
            {results.customers.slice(0, 10).map((c: any) => (
              <li key={c.phone}>
                {c.phone} {c.name} - ${c.total.toFixed(2)} ({c.orders} ventas)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;

import React, { useState } from 'react';
import { useServices } from '../hooks/useServices.js';
import { Input } from '../components/Input.tsx';
import { Button } from '../components/Button.tsx';

const CostVarianceReportPage: React.FC = () => {
  const { costVarianceReport: costVarianceReportService } = useServices();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!from || !to) {
      setError('Seleccione rango.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fromIso = new Date(`${from}T00:00:00`).toISOString();
      const toIso = new Date(`${to}T23:59:59`).toISOString();
      const data = await costVarianceReportService.summary(fromIso, toIso);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Cost Variance Report</h2>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} variant="outline" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} variant="outline" />
        <Button variant="primary" onClick={handleGenerate} loading={loading}>
          {loading ? 'Generando...' : 'Generar'}
        </Button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results && (
        <div style={{ marginTop: '1rem', fontSize: '.75rem' }}>
          <p>
            Registros: {results.count} | Variance Total: ${results.totalVariance}
          </p>
          <h3>Top 20 (absoluto)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f77f00', color: '#fff' }}>
                <th>Producto</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              {results.top.map((r: any) => (
                <tr key={r.name} style={{ borderBottom: '1px solid #ddd' }}>
                  <td>{r.name}</td>
                  <td style={{ textAlign: 'right' }}>${r.variance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CostVarianceReportPage;

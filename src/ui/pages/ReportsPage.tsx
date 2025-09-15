import React, { useState } from 'react';
import { useServices } from '../hooks/useServices.ts';
import { Input } from '../components/Input.tsx';
import { Button } from '../components/Button.tsx';

export const ReportsPage: React.FC = () => {
  const { reports, auth } = useServices();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [out, setOut] = useState<any|null>(null);

  const run = async () => {
    if(!from || !to) return;
    const fromIso = new Date(from + 'T00:00:00').toISOString();
    const toIso = new Date(to + 'T23:59:59').toISOString();
    const sales = await reports.salesByDateRange(fromIso, toIso);
    const top = await reports.topProducts(fromIso, toIso, 5);
    const cats = await reports.totalsByCategory(fromIso, toIso);
    setOut({ sales, top, cats });
  };

  if(!auth.hasPermission('REPORT_VIEW')) return <p>No autorizado.</p>;

  return (
    <div>
      <h2 className="section-title">Reportes</h2>
      <div className="form-group" style={{maxWidth:600}}>
        <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} variant="outline" />
        <Input type="date" value={to} onChange={e=>setTo(e.target.value)} variant="outline" />
        <Button variant="primary" onClick={run}>Generar</Button>
      </div>
      <div style={{marginTop:'1rem'}}>
        {out && (
          <div style={{fontSize:'.75rem'}}>
            <h3>Resumen Ventas</h3>
            <p>Ventas: {out.sales.count} | Total: ${'{'}out.sales.total{'}'}</p>
            <h3>Top Productos</h3>
            <ul>{out.top.map((t:any)=> <li key={t.id}>{t.name} - Cant: {t.qty} - ${'{'}t.revenue{'}'}</li>)}</ul>
            <h3>Por Categoría</h3>
            <ul>{out.cats.map((c:any)=> <li key={c.category}>{c.category}: Cant {c.qty} - ${'{'}c.revenue{'}'}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
};

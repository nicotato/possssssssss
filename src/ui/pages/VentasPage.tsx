import React from 'react';
import { useSalesHistory } from '../hooks/useOrders.ts';
import { useConfirm } from '../components/ConfirmProvider.tsx';
import { useToasts } from '../components/ToastProvider.tsx';

export const VentasPage: React.FC = () => {
  const { list, printInvoice, cancel, perms } = useSalesHistory();
  const { confirm } = useConfirm();
  const { push } = useToasts();
  if(!perms.canView) return <p>No autorizado.</p>;
  return (
    <div>
      <h2 className="section-title">Ventas Recientes</h2>
      <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:'.5rem'}}>
        {list.map(o=> (
          <li key={o.id} style={{border:'1px solid #eee', borderRadius:8, padding:'.5rem', fontSize:'.65rem'}}>
            <header style={{display:'flex', justifyContent:'space-between'}}>
              <strong>#{o.id}</strong>
              <span className={`tag ${o.status}`}>{o.status}</span>
            </header>
            <div>
              <small>{new Date(o.createdAt).toLocaleString()}</small><br />
              {o.customer?.phone && <small>Cliente: {o.customer?.name || ''} ({o.customer.phone})<br /></small>}
              <small>Líneas: {o.lines.length} | Total: ${'{'}o.total{'}'}</small>
            </div>
            <div style={{display:'flex', gap:'.3rem', marginTop:'.3rem'}}>
              {perms.canPrint && <button className="btn-outline btn-sm" onClick={()=>printInvoice(o.id)}>Factura</button>}
              {perms.canCancel && o.status==='completed' && <button className="btn-outline btn-sm" onClick={async ()=>{ if(await confirm({ message:'¿Anular venta?' })) { await cancel(o.id); push({ type:'success', message:'Venta anulada'}); } }}>Anular</button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

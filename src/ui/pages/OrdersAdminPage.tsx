import React, { useMemo, useState } from 'react';
import { useOrdersAdmin } from '../hooks/useOrders.ts';
import { useConfirm } from '../components/ConfirmProvider.tsx';
import { useToasts } from '../components/ToastProvider.tsx';
import { Input, Button, StatusBadge } from '../components/index.js';

export const OrdersAdminPage: React.FC = () => {
  const { list, printInvoice, printKitchen, cancel, fulfill, perms } = useOrdersAdmin();
  const { confirm } = useConfirm();
  const { push } = useToasts();
  const [filter, setFilter] = useState('');
  if(!perms.view) return <p>No autorizado.</p>;
  const filtered = useMemo(()=> list.filter(o=> {
    const term = filter.toLowerCase();
    const customerName = o.customer?.name || '';
    const customerPhone = o.customer?.phone || '';
    return o.id.toLowerCase().includes(term) || customerName.toLowerCase().includes(term) || customerPhone.includes(term);
  }), [list, filter]);
  return (
    <div>
      <h2 className="section-title">Órdenes</h2>
      <div style={{margin:'.5rem 0'}}>
        <Input 
          placeholder="Buscar por ID o cliente..." 
          value={filter} 
          onChange={e=>setFilter(e.target.value)} 
          variant="outline"
          leftIcon="🔍"
        />
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:'.65rem'}}>
        <thead>
          <tr style={{background:'#f77f00', color:'#fff'}}>
            <th>ID</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Cliente</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(o=> (
            <tr key={o.id} style={{borderBottom:'1px solid #ddd'}}>
              <td>{o.id}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td><StatusBadge status={o.status} /></td>
              <td>${'{'}o.total{'}'}</td>
              <td>{o.customer?.name || ''} {o.customer?.phone ? `(${o.customer.phone})`: ''}</td>
              <td style={{display:'flex', flexWrap:'wrap', gap:'.3rem'}}>
                {perms.printInv && <Button variant="outline" size="small" onClick={()=>printInvoice(o.id)} leftIcon="📄">Factura</Button>}
                {perms.printKitchen && <Button variant="outline" size="small" onClick={()=>printKitchen(o.id)} leftIcon="🍳">Comanda</Button>}
                {perms.cancel && o.status==='completed' && <Button variant="warning" size="small" onClick={async ()=>{ if(await confirm({ message:'¿Anular orden?' })) { await cancel(o.id); push({ type:'success', message:'Orden anulada'}); } }}>Anular</Button>}
                {perms.fulfill && o.status==='completed' && <Button variant="success" size="small" onClick={async ()=>{ await fulfill(o.id); push({ type:'success', message:'Orden entregada'}); }}>Entregar</Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useServices } from '../hooks/useServices.ts';
import { DataTable } from '../components/DataTable.tsx';

interface AuditLog { id?:string; timestamp:string; user?:string; action:string; details?:any; }

export const AuditPage: React.FC = () => {
  const { audit, auth } = useServices();
  const [rows, setRows] = useState<AuditLog[]>([]);
  useEffect(()=>{ (async()=>{ if(auth.hasPermission('AUDIT_VIEW') && audit.list) { const l = await audit.list(150); setRows(l); } })(); }, [audit, auth]);
  return (
    <div>
      <h2 className="section-title">Auditoría</h2>
      <DataTable
        columns={[
          { key:'timestamp', header:'Fecha', render:(r:AuditLog)=> new Date(r.timestamp).toLocaleString() },
          { key:'user', header:'Usuario' },
          { key:'action', header:'Acción' },
          { key:'details', header:'Detalles', render:(r:AuditLog)=> <pre style={{whiteSpace:'pre-wrap', margin:0}}>{JSON.stringify(r.details||{}, null, 0)}</pre> }
        ]}
        rows={rows}
        rowKey={(r:AuditLog)=> r.id || r.timestamp + r.action}
      />
    </div>
  );
};

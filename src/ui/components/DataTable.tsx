import React from 'react';

interface Col<T extends Record<string, any>> { key: keyof T & string; header: string; render?: (row:T)=>React.ReactNode; }
interface Props<T extends Record<string, any>> { columns: Col<T>[]; rows: T[]; rowKey: (row:T)=>string; emptyMessage?: string; }

export function DataTable<T extends Record<string, any>>({ columns, rows, rowKey, emptyMessage='Sin datos' }: Props<T>) {
  return (
    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'.7rem'}}>
      <thead>
        <tr style={{background:'#f77f00', color:'#fff'}}>
          {columns.map(c=> <th key={c.key}>{c.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length===0 && (
          <tr><td colSpan={columns.length} style={{textAlign:'center', padding:'.6rem'}}>{emptyMessage}</td></tr>
        )}
        {rows.map(r=> (
          <tr key={rowKey(r)} style={{borderBottom:'1px solid #ddd'}}>
            {columns.map(c=> <td key={c.key}>{c.render? c.render(r) : (r[c.key])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

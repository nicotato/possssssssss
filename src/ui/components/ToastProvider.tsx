import React, { createContext, useCallback, useContext, useState } from 'react';

export interface Toast { id:string; type?:'info'|'success'|'error'|'warning'; message:string; ttl?:number }
interface ToastCtxValue { toasts:Toast[]; push:(t:Omit<Toast,'id'>)=>void; remove:(id:string)=>void; }
const ToastCtx = createContext<ToastCtxValue|null>(null);
export const useToasts = ()=> { const v = useContext(ToastCtx); if(!v) throw new Error('ToastProvider missing'); return v; };

export const ToastProvider:React.FC<{children:React.ReactNode}> = ({ children }) => {
  const [toasts,setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id:string)=> setToasts(ts=> ts.filter(t=>t.id!==id)),[]);
  const push = useCallback((t:Omit<Toast,'id'>)=> {
    const id = Math.random().toString(36).slice(2);
    const ttl = t.ttl ?? 4000;
    const toast:Toast = { id, ...t };
    setToasts(ts=> [...ts, toast]);
    if(ttl>0) setTimeout(()=> remove(id), ttl);
  },[remove]);
  return (
    <ToastCtx.Provider value={{ toasts, push, remove }}>
      {children}
      <div style={{position:'fixed', top:10, right:10, display:'flex', flexDirection:'column', gap:'.5rem', zIndex:2000}}>
        {toasts.map(t=> (
          <div key={t.id} style={{minWidth:220, background:'#fff', borderLeft:`4px solid ${colorFor(t.type)}`, boxShadow:'0 2px 6px rgba(0,0,0,.15)', padding:'.6rem .8rem', fontSize:'.7rem', borderRadius:6, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>{t.message}</span>
            <button onClick={()=>remove(t.id)} style={{background:'transparent', border:'none', cursor:'pointer', fontSize:'.75rem'}}>×</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

function colorFor(type?:string) {
  switch(type) {
    case 'success': return '#2a9d8f';
    case 'error': return '#d62828';
    case 'warning': return '#f77f00';
    default: return '#264653';
  }
}

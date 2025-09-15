import React, { createContext, useCallback, useContext, useState } from 'react';
import { Modal } from './Modal.tsx';

interface ConfirmState { open:boolean; title?:string; message?:string; resolve?:(v:boolean)=>void; }
interface ConfirmCtxValue { confirm:(opts:{title?:string; message:string})=>Promise<boolean>; }
const ConfirmCtx = createContext<ConfirmCtxValue|null>(null);
export const useConfirm = ()=> { const v = useContext(ConfirmCtx); if(!v) throw new Error('ConfirmProvider missing'); return v; };

export const ConfirmProvider:React.FC<{children:React.ReactNode}> = ({ children }) => {
  const [st,setSt] = useState<ConfirmState>({ open:false });
  const confirm = useCallback((opts:{title?:string; message:string})=> {
    return new Promise<boolean>(res=> setSt({ open:true, ...opts, resolve:res }));
  },[]);
  const close = (val:boolean)=> { st.resolve?.(val); setSt({ open:false }); };
  return (
    <ConfirmCtx.Provider value={{ confirm }}>
      {children}
      <Modal open={st.open} title={st.title || 'Confirmar'} onClose={()=>close(false)}>
        <p style={{fontSize:'.75rem'}}>{st.message}</p>
        <div style={{display:'flex', gap:'.5rem', marginTop:'.8rem'}}>
          <button className="btn" onClick={()=>close(true)}>Aceptar</button>
          <button className="btn-outline" onClick={()=>close(false)}>Cancelar</button>
        </div>
      </Modal>
    </ConfirmCtx.Provider>
  );
};

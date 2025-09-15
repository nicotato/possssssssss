import React from 'react';

interface ModalProps { open: boolean; title?: string; onClose(): void; children: React.ReactNode; }
export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children }) => {
  if(!open) return null;
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
      <div style={{background:'#fff', padding:'1rem', borderRadius:8, minWidth:320, maxWidth:560}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.5rem'}}>
          <h3 style={{margin:0, fontSize:'1rem'}}>{title}</h3>
          <button className="btn-outline btn-sm" onClick={onClose}>X</button>
        </div>
        <div style={{fontSize:'.75rem'}}>{children}</div>
      </div>
    </div>
  );
};

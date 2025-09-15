import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

export const SyncStatus: React.FC = () => {
  const online = useOnlineStatus();
  return (
    <div style={{position:'fixed', bottom:8, right:8, fontSize:'.6rem', background:'#fff', padding:'.3rem .6rem', borderRadius:6, boxShadow:'0 2px 4px rgba(0,0,0,.2)', display:'flex', gap:'.4rem', alignItems:'center', zIndex:500}}>
      <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background: online ? '#2a9d8f':'#d62828'}} />
      {online ? 'Online':'Offline'}
    </div>
  );
};

import React from 'react';

export const Tag: React.FC<{children:React.ReactNode; color?:string}> = ({ children, color='#eee' }) => (
  <span style={{background:color, padding:'.15rem .4rem', borderRadius:4, fontSize:'.55rem'}}>{children}</span>
);

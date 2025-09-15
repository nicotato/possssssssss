import { useServices } from './useServices.ts';
import { useState, useEffect } from 'react';

export function useAuth() {
  const { auth } = useServices();
  const [isAuth, setIsAuth] = useState(() => auth.isAuthenticated());
  const [user, setUser] = useState(() => auth.getUsername?.());

  useEffect(()=>{
    // naive polling until event system added
    const t = setInterval(()=>{
      const a = auth.isAuthenticated();
      if(a !== isAuth) setIsAuth(a);
      const u = auth.getUsername?.();
      if(u !== user) setUser(u);
    }, 1500);
    return ()=> clearInterval(t);
  }, [auth, isAuth, user]);

  return {
    isAuthenticated: isAuth,
    username: user,
    hasPermission: (p:string)=> auth.hasPermission?.(p) ?? false,
    raw: auth
  };
}

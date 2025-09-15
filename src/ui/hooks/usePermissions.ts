import { useAuth } from './useAuth.ts';

export function usePermissions() {
  const { hasPermission } = useAuth();
  return { can: hasPermission };
}

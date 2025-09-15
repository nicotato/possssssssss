import { useAppState } from '../AppContext.tsx';
import type { ServicesRegistry } from '../types/services.d.ts';

export function useServices(): ServicesRegistry {
  return useAppState().services;
}

export function useRepos() {
  return useAppState().repos;
}

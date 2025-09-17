import React, { createContext, useContext } from 'react';
import type { ServicesRegistry, ProductDTO, RoleDTO, UserDTO, OrderDTO, CustomerDTO } from './types/services.d.ts';

// Repository surface (progressive hardening)
export interface ProductsRepo { getAll():Promise<any[]>; findById(id:string):Promise<any>; col:any; }
export interface CustomersRepo { findByPhone(phone:string):Promise<CustomerDTO|undefined>; create(data:CustomerDTO):Promise<CustomerDTO>; }
export interface OrdersRepo { listRecent(limit:number):Promise<OrderDTO[]>; findById(id:string):Promise<OrderDTO|undefined>; }
export interface RolesRepo { getAll?():Promise<RoleDTO[]>; }
export interface UsersRepo { getAll?():Promise<UserDTO[]>; }
export interface WasteRepo { col:any; }
export interface IngredientsRepo { col:any; }
export interface PromotionsRepo { col:any; active?(location:string):Promise<any[]>; }
export interface PriceExperimentsRepo { col:any; }
export interface Repos {
  products: ProductsRepo;
  customers?: CustomersRepo;
  orders?: OrdersRepo;
  roles?: RolesRepo;
  users?: UsersRepo;
  waste?: WasteRepo;
  ingredients?: IngredientsRepo;
  promotions?: PromotionsRepo;
  priceExperiments?: PriceExperimentsRepo;
}
export interface AppStateValue {
  services: ServicesRegistry;
  repos: Repos;
  rawState: any; // existing legacy state object
}

const AppStateCtx = createContext<AppStateValue | null>(null);
export const useAppState = () => {
  const v = useContext(AppStateCtx);
  if(!v) throw new Error('AppState provider missing');
  return v;
};

export const AppStateProvider: React.FC<{value: AppStateValue; children: React.ReactNode}> = ({ value, children }) => {
  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
};

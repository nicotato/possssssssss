import { useEffect, useState, useCallback } from 'react';
import { useServices } from './useServices.ts';
import type { OrderDTO } from '../types/services.d.ts';

interface Order { id:string; status:string; createdAt:string; total:number; customerName?:string; customerPhone?:string; lines:any[]; }

export function useSalesHistory(limit=100) {
  const { auth, orders, audit, printing } = useServices();
  const [list, setList] = useState<OrderDTO[]>([]);
  const canView = auth.hasPermission('SALE_VIEW');
  const canPrint = auth.hasPermission('INVOICE_PRINT');
  const canCancel = auth.hasPermission('SALE_CANCEL');
  const load = useCallback(async ()=> {
    if(!canView) return;
  const all = await orders.orderRepository.listRecent(limit);
  setList(all);
  }, [canView, limit, orders]);
  useEffect(()=>{ load(); }, [load]);

  const printInvoice = async (id:string) => {
    if(!canPrint) return;
  const order = await orders.orderRepository.findById(id);
  if(!order) return;
  printing?.printInvoice(order, () => orders.markPrinted(order.id,'invoice'));
  };
  const cancel = async (id:string) => {
    if(!canCancel) return;
    await orders.cancelOrder(id);
    load();
  };
  return { list, reload: load, printInvoice, cancel, perms:{canView, canPrint, canCancel} };
}

export function useOrdersAdmin(limit=200) {
  const { auth, orders, audit, printing } = useServices();
  const [list, setList] = useState<OrderDTO[]>([]);
  const perms = {
    view: auth.hasPermission('SALE_VIEW'),
    printInv: auth.hasPermission('INVOICE_PRINT'),
    printKitchen: auth.hasPermission('KITCHEN_PRINT'),
    cancel: auth.hasPermission('SALE_CANCEL'),
    fulfill: auth.hasPermission('SALE_FULFILL')
  };
  const load = useCallback(async ()=> {
    if(!perms.view) return;
  const all = await orders.orderRepository.listRecent(limit);
  setList(all);
  }, [perms.view, limit, orders]);
  useEffect(()=>{ load(); }, [load]);

  const printInvoice = async (id:string) => {
    if(!perms.printInv) return;
  const o = await orders.orderRepository.findById(id);
  if(!o) return;
  printing?.printInvoice(o, ()=> orders.markPrinted(id,'invoice'));
    audit?.log('PRINT_INVOICE',{ orderId:id, user: auth.getUsername() });
  };
  const printKitchen = async (id:string) => {
    if(!perms.printKitchen) return;
  const o = await orders.orderRepository.findById(id);
  if(!o) return;
  printing?.printKitchen(o, ()=> orders.markPrinted(id,'kitchen'));
    audit?.log('PRINT_KITCHEN',{ orderId:id, user: auth.getUsername() });
  };
  const cancel = async (id:string) => { if(!perms.cancel) return; await orders.cancelOrder(id); load(); };
  const fulfill = async (id:string) => { if(!perms.fulfill) return; await orders.fulfillOrder(id); load(); };

  return { list, reload: load, printInvoice, printKitchen, cancel, fulfill, perms };
}

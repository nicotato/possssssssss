import { useServices } from './useServices.ts';
import type { OrderDTO } from '../types/services.d.ts';

export function usePrinting() {
  const { auth, printing, orders, audit } = useServices();
  const canInv = auth.hasPermission('INVOICE_PRINT');
  const canKitch = auth.hasPermission('KITCHEN_PRINT');

  const printInvoice = async (orderIdOrObj: string | OrderDTO) => {
    if(!canInv) return;
    const order: OrderDTO | undefined = typeof orderIdOrObj === 'string'
      ? await orders.orderRepository.findById(orderIdOrObj)
      : orderIdOrObj;
    if(!order) return;
  printing?.printInvoice(order, ()=> orders.markPrinted(order.id,'invoice'));
    audit?.log('PRINT_INVOICE',{ orderId:order.id, user: auth.getUsername() });
  };

  const printKitchen = async (orderIdOrObj: string | OrderDTO) => {
    if(!canKitch) return;
    const order: OrderDTO | undefined = typeof orderIdOrObj === 'string'
      ? await orders.orderRepository.findById(orderIdOrObj)
      : orderIdOrObj;
    if(!order) return;
  printing?.printKitchen(order, ()=> orders.markPrinted(order.id,'kitchen'));
    audit?.log('PRINT_KITCHEN',{ orderId:order.id, user: auth.getUsername() });
  };

  return { printInvoice, printKitchen, perms:{ canInv, canKitch } };
}

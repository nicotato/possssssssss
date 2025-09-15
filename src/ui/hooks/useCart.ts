import { useCallback, useMemo, useState } from 'react';
import { useServices, useRepos } from './useServices.ts';
import type { OrderLineDTO, DiscountDTO, PaymentDTO, PricingResult, PaymentStatus, CustomerDTO, OrderDTO } from '../types/services.d.ts';

export interface CartLine extends OrderLineDTO {}
export interface DiscountDraft extends DiscountDTO {}
export interface PaymentDraft extends PaymentDTO {}

export interface UseCartResult {
  lines: CartLine[];
  discounts: DiscountDraft[]; payments: PaymentDraft[];
  subTotal: number;
  pricing: PricingResult;
  payment: PaymentStatus;
  addProduct(id:string):Promise<void>;
  changeQty(pid:string, delta:number):void;
  removeLine(pid:string):void;
  clear():void;
  addDiscount(d:DiscountDraft):void; removeDiscount(idx:number):void;
  addPayment(p:PaymentDraft):void; removePayment(idx:number):void;
  findCustomer(phone:string):Promise<CustomerDTO|null>;
  createCustomer(data:CustomerDTO):Promise<CustomerDTO|undefined>;
  customer:CustomerDTO|null;
  finalize(opts:{printKitchen?:boolean}):Promise<OrderDTO>;
  status:'idle'|'finalizing';
  canSell:boolean;
}

export function useCart(): UseCartResult {
  const services = useServices();
  const { cart, orders, pricing, auth } = services;
  const repos = useRepos();
  const [discounts, setDiscounts] = useState<DiscountDraft[]>([]);
  const [payments, setPayments] = useState<PaymentDraft[]>([]);
  const [customer, setCustomer] = useState<CustomerDTO|null>(null);
  const [status, setStatus] = useState<'idle'|'finalizing'>('idle');

  const lines:CartLine[] = cart.toArray();
  const subTotal = cart.total();
  const pricingCalc = useMemo(()=> pricing.calculate(lines, discounts), [lines, discounts, pricing]);
  const paymentCalc = useMemo(()=> pricing.evaluatePaymentStatus(pricingCalc.grandTotal, payments), [pricingCalc, payments, pricing]);

  const addProduct = useCallback(async (id:string)=>{
    const doc = await repos.products.findById(id); if(!doc) return;
    cart.addProduct(doc.toJSON());
  },[cart, repos.products]);

  const changeQty = useCallback((pid:string, delta:number)=>{ cart.changeQty(pid, delta); },[cart]);
  const removeLine = useCallback((pid:string)=>{ cart.remove(pid); },[cart]);
  const clear = useCallback(()=>{ cart.clear(); },[cart]);

  const addDiscount = (d:DiscountDraft) => setDiscounts(ds=> [...ds, d]);
  const removeDiscount = (idx:number) => setDiscounts(ds=> ds.filter((_,i)=> i!==idx));
  const addPayment = (p:PaymentDraft) => setPayments(ps=> [...ps, p]);
  const removePayment = (idx:number) => setPayments(ps=> ps.filter((_,i)=> i!==idx));
  const clearDiscountsPayments = () => { setDiscounts([]); setPayments([]); };

  const findCustomer = async (phone:string) => {
    const doc = await repos.customers?.findByPhone(phone);
    setCustomer(doc||null);
    return doc||null;
  };
  const createCustomer = async (data:CustomerDTO) => {
    const created = await repos.customers?.create(data);
    if(created) setCustomer(created);
    return created;
  };

  const finalize = async (opts:{printKitchen?:boolean}) => {
    setStatus('finalizing');
    try {
      const order = await orders.finalizeSale({ customerData: customer||undefined, discounts, payments });
      
      // Imprimir la factura automáticamente después de finalizar
      if (services.printing) {
        services.printing.printInvoice(order, () => {
          orders.markPrinted(order.id, 'invoice');
        });
        
        // Si se solicita imprimir cocina
        if (opts.printKitchen) {
          services.printing.printKitchen(order, () => {
            orders.markPrinted(order.id, 'kitchen');
          });
        }
      }
      
      clearDiscountsPayments();
      setCustomer(null); // Limpiar cliente también
      return order;
    } finally { 
      setStatus('idle'); 
    }
  };

  return {
    lines,
    discounts, payments,
    subTotal,
    pricing: pricingCalc,
    payment: paymentCalc,
    addProduct, changeQty, removeLine, clear,
    addDiscount, removeDiscount,
    addPayment, removePayment,
    findCustomer, createCustomer,
    customer,
    finalize,
    status,
    canSell: auth.hasPermission?.('SALE_CREATE')
  };
}

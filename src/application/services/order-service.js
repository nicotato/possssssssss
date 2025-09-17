// MODIFICADO para utilizar PricingService, descuentos y pagos
import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';

export class OrderService {
  constructor(orderRepository, cartService, audit, auth, queueRepo, pricingService) {
    this.orderRepository = orderRepository;
    this.cartService = cartService;
    this.audit = audit;
    this.auth = auth;
    this.queue = queueRepo;
    this.pricing = pricingService;
  }

  async finalizeSale({ customerData, discounts = [], payments = [] }) {
    if (this.cartService.isEmpty()) throw new Error('Carrito vacío');
    
    // Obtener datos del carrito con impuestos
    const orderData = this.cartService.toOrderData ? 
      this.cartService.toOrderData(customerData) : 
      this._buildLegacyOrderData(customerData, discounts, payments);

    // Aplicar descuentos y pagos usando el pricing service
    const lines = orderData.lines || this.cartService.toArray().map(l => ({ ...l }));
    const { subTotal, discountTotal, grandTotal, appliedDiscounts } =
      this.pricing.calculate(lines, discounts);
    // Calcular total final incluyendo impuestos
    const cartTotal = orderData.total || 0; // Total del carrito con impuestos
    const totalWithTaxes = cartTotal - discountTotal; // Aplicar descuentos al total con impuestos
    
    const { amountPaid, changeDue, paymentStatus } =
      this.pricing.evaluatePaymentStatus(totalWithTaxes, payments);

    const order = {
      ...orderData,
      id: orderData.id || generateId('o'),
      createdAt: orderData.createdAt || nowIso(),
      status: 'completed',
      lines,
      subTotal,
      discountTotal,
      grandTotal, // Sin impuestos (para compatibilidad con reportes antiguos)
      discounts: appliedDiscounts,
      payments,
      amountPaid,
      changeDue,
      paymentStatus,
      total: totalWithTaxes, // Total final con impuestos y descuentos
      customerPhone: customerData?.phone || '',
      customerName: customerData?.name || '',
      sync: { synced: false, lastAttempt: null },
      kitchenPrinted: false,
      invoicePrinted: false
    };
    await this.orderRepository.create(order);
    await this.audit.log('SALE_CREATE', { orderId: order.id, user: this.auth.getUsername() });
    await this.queue.enqueue({
      id: generateId('q_'),
      entityCollection: 'orders',
      docId: order.id,
      op: 'INSERT',
      payload: order,
      createdAt: nowIso(),
      retries: 0,
      status: 'pending'
    });
    this.cartService.clear();
    return order;
  }

  _buildLegacyOrderData(customerData, discounts, payments) {
    // Fallback para cuando el cartService no tiene toOrderData
    const lines = this.cartService.toArray().map(l => ({ ...l }));
    return {
      id: generateId('o'),
      createdAt: nowIso(),
      lines,
      taxLines: [],
      taxTotal: 0,
      customerPhone: customerData?.phone || '',
      customerName: customerData?.name || ''
    };
  }

  async cancelOrder(id) {
    const doc = await this.orderRepository.col.findOne(id).exec();
    if(!doc) throw new Error('Orden no encontrada');
    await doc.incrementalPatch({ status:'canceled' });
    await this.audit.log('SALE_CANCEL', { orderId:id, user: this.auth.getUsername() });
  }

  async fulfillOrder(id) {
    const doc = await this.orderRepository.col.findOne(id).exec();
    if(!doc) throw new Error('Orden no encontrada');
    await doc.incrementalPatch({ status:'fulfilled' });
    await this.audit.log('SALE_FULFILL', { orderId:id, user: this.auth.getUsername() });
  }

  async markPrinted(id, type) {
    const doc = await this.orderRepository.col.findOne(id).exec();
    if(!doc) return;
    const patch = {};
    if(type === 'invoice') patch.invoicePrinted = true;
    if(type === 'kitchen') patch.kitchenPrinted = true;
    await doc.incrementalPatch(patch);
  }
}
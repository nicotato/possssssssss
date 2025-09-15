import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';
import { FinalizeSaleInputSchema, type FinalizeSaleInput } from '../../domain/validation/order-schema.ts';
import { ValidationError, NotFoundError } from '../../domain/errors/errors.ts';

export class OrderService {
  private orderRepository: any;
  private cartService: any;
  private audit: any;
  private auth: any;
  private queue: any;
  private pricing: any;
  constructor(orderRepository:any, cartService:any, audit:any, auth:any, queueRepo:any, pricingService:any) {
    this.orderRepository = orderRepository;
    this.cartService = cartService;
    this.audit = audit;
    this.auth = auth;
    this.queue = queueRepo;
    this.pricing = pricingService;
  }

  async finalizeSale(input: FinalizeSaleInput) {
    const parsed = FinalizeSaleInputSchema.safeParse(input || {});
    if(!parsed.success) {
      throw new ValidationError('Datos inválidos para la venta', parsed.error.flatten());
    }
    const { customerData = null, discounts = [], payments = [] } = parsed.data;
    if (this.cartService.isEmpty()) throw new ValidationError('Carrito vacío');
    const lines = this.cartService.toArray().map((l:any) => ({ ...l }));
    const { subTotal, discountTotal, grandTotal, appliedDiscounts } =
      this.pricing.calculate(lines, discounts as any);
    const { amountPaid, changeDue, paymentStatus } =
      this.pricing.evaluatePaymentStatus(grandTotal, payments as any);

    const order = {
      id: generateId('o'),
      createdAt: nowIso(),
      status: 'completed',
      lines,
      subTotal,
      discountTotal,
      grandTotal,
      discounts: appliedDiscounts,
      payments,
      amountPaid,
      changeDue,
      paymentStatus,
      total: grandTotal,
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

  async cancelOrder(id:string) {
    const doc = await this.orderRepository.col.findOne(id).exec();
    if(!doc) throw new NotFoundError('Orden no encontrada');
    await doc.incrementalPatch({ status:'canceled' });
    await this.audit.log('SALE_CANCEL', { orderId:id, user: this.auth.getUsername() });
  }

  async fulfillOrder(id:string) {
    const doc = await this.orderRepository.col.findOne(id).exec();
    if(!doc) throw new NotFoundError('Orden no encontrada');
    await doc.incrementalPatch({ status:'fulfilled' });
    await this.audit.log('SALE_FULFILL', { orderId:id, user: this.auth.getUsername() });
  }

  async markPrinted(id:string, type:'invoice'|'kitchen') {
    const doc = await this.orderRepository.col.findOne(id).exec();
    if(!doc) return;
    const patch: any = {};
    if(type === 'invoice') patch.invoicePrinted = true;
    if(type === 'kitchen') patch.kitchenPrinted = true;
    await doc.incrementalPatch(patch);
  }
}

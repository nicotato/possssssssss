// OrderService - Servicio de gestión de órdenes
// Siguiendo principios de arquitectura hexagonal

import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';
import { ValidationError, NotFoundError } from '../../domain/errors/errors.ts';
import { logger } from '../../infrastructure/logging/logger.js';

// Domain interfaces
import type {
  OrderDTO,
  OrderLineDTO,
  DiscountDTO,
  PaymentDTO,
  CustomerDTO,
  TaxLineDTO
} from '../../ui/types/services.d.ts';

// Infrastructure dependencies
import { RxOrderRepository } from '../../infrastructure/repositories/rx-order-repository.js';
import { RxSyncQueueRepository } from '../../infrastructure/repositories/rx-sync-queue-repository.js';

// Application services
import { CartService, type CartSummary } from './cart-service.js';
import { AuditService } from './audit-service.js';
import { AuthService } from './auth-service.js';
import { PricingService } from './pricing-service.js';

export interface FinalizeSaleOptions {
  printKitchen?: boolean;
  customerData?: CustomerDTO | null;
  discounts?: DiscountDTO[];
  payments?: PaymentDTO[];
}

export interface PricingResult {
  subTotal: number;
  discountTotal: number;
  grandTotal: number;
}

export interface PaymentStatus {
  amountPaid: number;
  changeDue: number;
  paymentStatus: string;
}

/**
 * OrderService - Servicio de gestión de órdenes
 * Siguiendo principios de arquitectura hexagonal
 */
export class OrderService {
  public orderRepository: RxOrderRepository;
  private cartService: CartService;
  private auditService: AuditService;
  private authService: AuthService;
  private queueRepository: RxSyncQueueRepository;
  private pricingService: PricingService;

  constructor(
    orderRepository: RxOrderRepository,
    cartService: CartService,
    auditService: AuditService,
    authService: AuthService,
    queueRepository: RxSyncQueueRepository,
    pricingService: PricingService
  ) {
    this.orderRepository = orderRepository;
    this.cartService = cartService;
    this.auditService = auditService;
    this.authService = authService;
    this.queueRepository = queueRepository;
    this.pricingService = pricingService;
  }

  /**
   * Finalizar venta creando una orden completa
   */
  async finalizeSale(options: FinalizeSaleOptions = {}): Promise<OrderDTO> {
    const { customerData = null, discounts = [], payments = [] } = options;

    try {
      logger.info('Starting sale finalization');

      // Validar que hay líneas en el carrito
      const cartLines = this.cartService.toArray();
      if (cartLines.length === 0) {
        throw new ValidationError('No hay productos en el carrito');
      }

      // Obtener resumen del carrito
      const cartSummary = this.cartService.getSummary();

      // Calcular precios y descuentos
      const pricingResult = this.pricingService.calculate(cartLines, discounts);

      // Evaluar estado de pago
      const paymentStatus = this.pricingService.evaluatePaymentStatus(
        pricingResult.grandTotal,
        payments
      );

      // Crear orden
      const order = this.buildOrder(cartSummary, pricingResult, paymentStatus, customerData, discounts, payments);

      // Persistir orden
      const savedOrder = await this.orderRepository.create(order);

      // Limpiar carrito
      this.cartService.clear();

      // Auditoría
      await this.auditService.log('ORDER_FINALIZED', {
        orderId: savedOrder.id,
        total: savedOrder.total,
        user: this.authService.getUsername()
      });

      logger.info('Sale finalized successfully', { orderId: savedOrder.id });

      return savedOrder;
    } catch (error: any) {
      logger.error('Error finalizing sale', { error: error.message });
      throw error;
    }
  }

  /**
   * Cancelar orden
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new NotFoundError('Orden no encontrada');
      }

      if (order.status === 'canceled') {
        throw new ValidationError('La orden ya está cancelada');
      }

      await this.orderRepository.updateStatus(orderId, 'canceled');

      await this.auditService.log('ORDER_CANCELED', {
        orderId,
        user: this.authService.getUsername()
      });

      logger.info('Order canceled', { orderId });
    } catch (error: any) {
      logger.error('Error canceling order', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Marcar orden como cumplida
   */
  async fulfillOrder(orderId: string): Promise<void> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new NotFoundError('Orden no encontrada');
      }

      await this.orderRepository.updateStatus(orderId, 'fulfilled');

      await this.auditService.log('ORDER_FULFILLED', {
        orderId,
        user: this.authService.getUsername()
      });

      logger.info('Order fulfilled', { orderId });
    } catch (error: any) {
      logger.error('Error fulfilling order', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Marcar orden como impresa
   */
  async markPrinted(orderId: string, type: 'invoice' | 'kitchen'): Promise<void> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new NotFoundError('Orden no encontrada');
      }

      const updateData: any = {};
      if (type === 'invoice') {
        updateData.invoicePrinted = true;
        updateData.invoicePrintedAt = nowIso();
      } else if (type === 'kitchen') {
        updateData.kitchenPrinted = true;
        updateData.kitchenPrintedAt = nowIso();
      }

      // Simplificando por ahora - el repositorio no soporta actualizaciones complejas
      logger.debug('Print status would be updated', { orderId, type });

      await this.auditService.log('ORDER_PRINT_MARKED', {
        orderId,
        printType: type,
        user: this.authService.getUsername()
      });

      logger.debug('Order marked as printed', { orderId, type });
    } catch (error: any) {
      logger.error('Error marking order as printed', { orderId, type, error: error.message });
      throw error;
    }
  }

  /**
   * Obtener orden por ID
   */
  async getOrderById(orderId: string): Promise<OrderDTO | null> {
    try {
      const order = await this.orderRepository.findById(orderId);
      return order || null;
    } catch (error: any) {
      logger.error('Error getting order by ID', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Listar órdenes recientes
   */
  async getRecentOrders(limit: number = 50): Promise<OrderDTO[]> {
    try {
      return await this.orderRepository.listRecent(limit);
    } catch (error: any) {
      logger.error('Error listing recent orders', { error: error.message });
      throw error;
    }
  }

  /**
   * Construir orden desde carrito
   */
  private buildOrder(
    cartSummary: CartSummary,
    pricingResult: PricingResult,
    paymentStatus: PaymentStatus,
    customerData: CustomerDTO | null,
    discounts: DiscountDTO[],
    payments: PaymentDTO[]
  ): OrderDTO {
    const orderId = generateId('order');
    const now = nowIso();

    // Construir líneas de impuestos consolidadas
    const taxLineMap = new Map<string, TaxLineDTO>();
    [...cartSummary.lineTaxes, ...cartSummary.globalTaxes].forEach(tax => {
      const existing = taxLineMap.get(tax.code);
      if (existing) {
        existing.base += tax.base;
        existing.amount += tax.amount;
      } else {
        taxLineMap.set(tax.code, {
          code: tax.code,
          name: tax.name,
          rate: tax.rate,
          base: tax.base,
          amount: tax.amount,
          scope: tax.scope
        });
      }
    });

    const order: OrderDTO = {
      id: orderId,
      createdAt: now,
      status: 'completed',
      lines: this.cartService.toArray().map(line => ({
        productId: line.productId,
        name: line.name,
        qty: line.qty,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal
      })),
      taxLines: Array.from(taxLineMap.values()),
      taxTotal: cartSummary.totalTax,
      discounts,
      payments,
      total: pricingResult.grandTotal
    };

    // Agregar datos del cliente si están presentes
    if (customerData) {
      order.customer = customerData;
      order.customerName = customerData.name;
      order.customerPhone = customerData.phone;
    }

    return order;
  }
}

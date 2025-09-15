import { RxJsonSchema } from 'rxdb';

export interface OrderLine {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  category?: string;
  stdUnitCost?: number;
  realUnitCost?: number;
  varianceUnit?: number;
}

export interface OrderPromotion {
  promoId: string;
  description: string;
  discountAmount: number;
}

export interface OrderTaxLine {
  code: string;
  base: number;
  rate: number;
  amount: number;
  scope: 'line' | 'global';
}

export interface OrderPayment {
  method: string;
  amount: number;
  currency: string;
  amountBase: number;
}

export interface OrderDocument {
  id: string;
  createdAt: string;
  status: 'completed' | 'canceled' | 'fulfilled';
  branchId?: string;
  lines: OrderLine[];
  netBeforePromotions?: number;
  netAfterPromotions?: number;
  promotionDiscountTotal?: number;
  appliedPromotions?: OrderPromotion[];
  discountTotal?: number;
  subTotal?: number;
  taxLines?: OrderTaxLine[];
  taxTotal?: number;
  tipAmount?: number;
  grandTotalBase?: number;
  grandTotalTx?: number;
  currencyUsed?: string;
  fxRate?: number;
  payments?: OrderPayment[];
  amountPaidBase?: number;
  changeDueBase?: number;
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  customerPhone?: string;
  customerName?: string;
  costStdTotalBase?: number;
  costRealTotalBase?: number;
  costVarianceBase?: number;
  kitchenStatus?: 'pending' | 'in_progress' | 'done';
  kitchenItems?: {
    lineId: string;
    productName: string;
    qty: number;
    doneQty: number;
  }[];
  sync?: {
    synced: boolean;
    lastAttempt?: string;
  };
  invoicePrinted?: boolean;
  kitchenPrinted?: boolean;
}

export const orderSchema: RxJsonSchema<OrderDocument> = {
  title: 'order schema v7',
  version: 7,
  primaryKey: {
    key: 'id',
    fields: ['id'],
    separator: '|'
  },
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 64 },
    createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
    status: { type: 'string', enum: ['completed','canceled','fulfilled'] },
    branchId: { type: 'string', maxLength: 64 },
    lines: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string', maxLength: 64 },
          name: { type: 'string', maxLength: 120 },
          qty: { type: 'number', minimum: 0.0001, multipleOf: 0.0001 },
            unitPrice: { type: 'number', minimum: 0, multipleOf: 0.01 },
          lineTotal: { type: 'number', minimum: 0, multipleOf: 0.01 },
          category: { type: 'string', maxLength: 64 },
          stdUnitCost: { type: 'number', minimum: 0, multipleOf: 0.0001 },
          realUnitCost: { type: 'number', minimum: 0, multipleOf: 0.0001 },
          varianceUnit: { type: 'number' }
        },
        required: ['productId','name','qty','unitPrice','lineTotal']
      }
    },
    netBeforePromotions: { type: 'number' },
    netAfterPromotions: { type: 'number' },
    promotionDiscountTotal: { type: 'number' },
    appliedPromotions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          promoId: { type: 'string', maxLength: 64 },
          description: { type: 'string', maxLength: 160 },
          discountAmount: { type: 'number', minimum: 0, multipleOf: 0.01 }
        },
        required: ['promoId','discountAmount']
      }
    },
    discountTotal: { type: 'number', minimum: 0, multipleOf: 0.01 },
    subTotal: { type: 'number', minimum: 0, multipleOf: 0.01 },
    taxLines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', maxLength: 32 },
          base: { type: 'number', minimum: 0 },
          rate: { type: 'number', minimum: 0 },
          amount: { type: 'number', minimum: 0 },
          scope: { type: 'string', enum: ['line','global'] }
        },
        required: ['code','base','rate','amount','scope']
      }
    },
    taxTotal: { type: 'number', minimum: 0 },
    tipAmount: { type: 'number', minimum: 0 },
    grandTotalBase: { type: 'number', minimum: 0 },
    grandTotalTx: { type: 'number', minimum: 0 },
    currencyUsed: { type: 'string', maxLength: 8 },
    fxRate: { type: 'number', minimum: 0 },
    payments: {
      type: 'array',
      items: {
        type:'object',
        properties: {
          method: { type:'string', maxLength: 32 },
          amount: { type:'number', minimum:0, multipleOf:0.01 },
          currency: { type:'string', maxLength:8 },
          amountBase: { type:'number', minimum:0, multipleOf:0.01 }
        },
        required:['method','amount','currency','amountBase']
      }
    },
    amountPaidBase: { type: 'number', minimum: 0 },
    changeDueBase: { type: 'number' },
    paymentStatus: { type:'string', enum:['unpaid','partial','paid'] },
    customerPhone: { type:'string', maxLength: 32 },
    customerName: { type:'string', maxLength: 120 },
    costStdTotalBase: { type: 'number', minimum:0 },
    costRealTotalBase: { type: 'number', minimum:0 },
    costVarianceBase: { type: 'number' },
    kitchenStatus: { type:'string', enum:['pending','in_progress','done'] },
    kitchenItems: {
      type:'array',
      items: {
        type:'object',
        properties:{
          lineId:{ type:'string', maxLength:64 },
          productName:{ type:'string', maxLength:120 },
          qty:{ type:'number', minimum:0 },
          doneQty:{ type:'number', minimum:0 }
        },
        required:['lineId','productName','qty']
      }
    },
    sync: {
      type:'object',
      properties:{
        synced:{ type:'boolean' },
        lastAttempt:{ type:'string', format:'date-time', maxLength:40 }
      }
    },
    invoicePrinted:{ type:'boolean' },
    kitchenPrinted:{ type:'boolean' }
  },
  required: ['id','createdAt','status','lines']
};
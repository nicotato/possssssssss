import { RxDocument, RxJsonSchema } from 'rxdb';
import { orderSchema } from '../../db/schemas/order.schema.ts';

export const orderMigrationStrategies: {
  [version: number]: (oldDoc: any) => any
} = {
  // v0 -> v1: añadimos campos kitchenPrinted/invoicePrinted por primera vez
  0: (doc) => {
    doc.invoicePrinted = doc.invoicePrinted ?? false;
    doc.kitchenPrinted = doc.kitchenPrinted ?? false;
    return doc;
  },
  // v1 -> v2: introducción descuentos/impuestos (ejemplo)
  1: (doc) => {
    doc.subTotal = doc.subTotal ?? doc.total ?? 0;
    doc.discountTotal = doc.discountTotal ?? 0;
    doc.taxTotal = doc.taxTotal ?? 0;
    return doc;
  },
  // v2 -> v3: campos de promociones
  2: (doc) => {
    doc.appliedPromotions = doc.appliedPromotions || [];
    doc.promotionDiscountTotal = doc.promotionDiscountTotal ?? 0;
    doc.netBeforePromotions = doc.netBeforePromotions ?? doc.subTotal ?? 0;
    doc.netAfterPromotions = doc.netAfterPromotions ?? doc.subTotal ?? 0;
    return doc;
  },
  // v3 -> v4: multi-sucursal
  3: (doc) => {
    doc.branchId = doc.branchId || 'b_default';
    return doc;
  },
  // v4 -> v5: costos std/real
  4: (doc) => {
    doc.costStdTotalBase = doc.costStdTotalBase ?? 0;
    doc.costRealTotalBase = doc.costRealTotalBase ?? 0;
    doc.costVarianceBase = doc.costVarianceBase ?? 0;
    if (Array.isArray(doc.lines)) {
  doc.lines.forEach((l:any) => {
        l.stdUnitCost = l.stdUnitCost ?? 0;
        l.realUnitCost = l.realUnitCost ?? 0;
        l.varianceUnit = l.varianceUnit ?? 0;
      });
    }
    return doc;
  },
  // v5 -> v6: multi-moneda
  5: (doc) => {
    doc.currencyUsed = doc.currencyUsed || 'BASE';
    doc.fxRate = doc.fxRate ?? 1;
    doc.grandTotalBase = doc.grandTotalBase ?? (doc.grossTotal || doc.total || 0);
    doc.grandTotalTx = doc.grandTotalTx ?? doc.grandTotalBase;
    return doc;
  },
  // v6 -> v7: consolidación de pipeline (tipAmount, paymentStatus robusto)
  6: (doc) => {
    doc.tipAmount = doc.tipAmount ?? 0;
    if (!doc.paymentStatus) {
      if ((doc.amountPaidBase ?? 0) === 0) doc.paymentStatus = 'unpaid';
      else if ((doc.amountPaidBase ?? 0) + 0.001 < (doc.grandTotalBase ?? 0)) doc.paymentStatus = 'partial';
      else doc.paymentStatus = 'paid';
    }
    return doc;
  }
};

export const ORDER_SCHEMA: RxJsonSchema<any> = orderSchema; // referencia final
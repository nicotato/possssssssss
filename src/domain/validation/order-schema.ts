import { z } from 'zod';

export const OrderLineSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  qty: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  lineTotal: z.number().nonnegative()
});

export const DiscountSchema = z.object({ type:z.string(), value:z.number(), label:z.string().optional() });
export const PaymentSchema = z.object({ method:z.string(), amount:z.number().nonnegative() });
export const CustomerSchema = z.object({ phone:z.string().min(3), name:z.string().min(1), address:z.string().optional(), barrio:z.string().optional() });

export const FinalizeSaleInputSchema = z.object({
  customerData: CustomerSchema.nullable().optional(),
  discounts: z.array(DiscountSchema).optional(),
  payments: z.array(PaymentSchema).optional()
});

export type FinalizeSaleInput = z.infer<typeof FinalizeSaleInputSchema>;
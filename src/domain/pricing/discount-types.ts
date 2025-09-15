/**
 * Tipos de eventos de descuento/promoción soportados por el pipeline.
 * Centraliza las constantes para evitar errores de tipeo.
 */

export const DiscountEventTypes = {
  DiscountPercentCart: 'discountPercentCart',
  DiscountFixedCart: 'discountFixedCart',
  DiscountPercentLine: 'discountPercentLine',
  DiscountFixedLine: 'discountFixedLine',
  BuyXGetY: 'buyXGetY',
  FreeItem: 'freeItem',
  ComboFixedPrice: 'comboFixedPrice'
} as const;

export type DiscountEventType = typeof DiscountEventTypes[keyof typeof DiscountEventTypes];

export interface DiscountEventBase {
  promoId?: string;
  type: DiscountEventType;
  description?: string;
  payload: any;
}

/**
 * Estructuras específicas (puedes ampliar):
 */
export interface PercentCartPayload {
  discountPercentCart: number;
  label?: string;
}

export interface FixedCartPayload {
  discountFixedCart: number;
  label?: string;
}

export interface BuyXGetYPayload {
  productId: string;
  buyQty: number;
  getQty: number;
}

export interface ComboFixedPricePayload {
  comboProductIds: string[];
  comboPrice: number;
}

export type DiscountEventPayload =
  | PercentCartPayload
  | FixedCartPayload
  | BuyXGetYPayload
  | ComboFixedPricePayload
  | Record<string, any>;
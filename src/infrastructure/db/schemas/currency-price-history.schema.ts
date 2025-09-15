import { RxJsonSchema } from 'rxdb';

export interface ProductPriceHistory {
  id: string;               // productId|currency|timestamp
  productId: string;
  currency: string;
  price: number;
  validFrom: string;
  validTo?: string;
  source?: 'manual' | 'sync' | 'import';
  note?: string;
}

export const productPriceHistorySchema: RxJsonSchema<ProductPriceHistory> = {
  title:'product price history schema',
  version:0,
  primaryKey:{
    key:'id',
    fields:['id'],
    separator:'|'
  },
  type:'object',
  properties:{
    id:{ type:'string', maxLength:100 },
    productId:{ type:'string', maxLength:64 },
    currency:{ type:'string', maxLength:8, pattern:'^[A-Z]{3,5}$' },
    price:{ type:'number', minimum:0, multipleOf:0.0001 },
    validFrom:{ type:'string', format:'date-time', maxLength:40 },
    validTo:{ type:'string', format:'date-time', maxLength:40 },
    source:{ type:'string', enum:['manual','sync','import'] },
    note:{ type:'string', maxLength:240 }
  },
  required:['id','productId','currency','price','validFrom']
};
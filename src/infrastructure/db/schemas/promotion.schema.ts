import { RxJsonSchema } from 'rxdb';

export interface Promotion {
  id: string;
  name: string;
  type: 'BUY_X_GET_Y' | 'SECOND_DISCOUNT' | 'COMBO_FIXED' | 'PERCENT_CART' | 'CUSTOM';
  active: boolean;
  priority?: number;
  stackable?: boolean;
  excludes?: string[];
  config?: Record<string, any>;
  appliesToBranchIds?: string[];
  validFrom?: string;
  validTo?: string;
  logic?: Record<string, any>;
  dsl?: string;
}

export const promotionSchema: RxJsonSchema<Promotion> = {
  title: 'promotion schema v2',
  version: 2,
  primaryKey: {
    key: 'id',
    fields: ['id'],
    separator: '|'
  },
  type:'object',
  properties:{
    id:{ type:'string', maxLength:64 },
    name:{ type:'string', maxLength:160 },
    type:{ type:'string', enum:['BUY_X_GET_Y','SECOND_DISCOUNT','COMBO_FIXED','PERCENT_CART','CUSTOM'] },
    active:{ type:'boolean' },
    priority:{ type:'number', minimum:0 },
    stackable:{ type:'boolean' },
    excludes:{
      type:'array',
      items:{ type:'string', maxLength:64 }
    },
    config:{ type:'object', additionalProperties:true },
    appliesToBranchIds:{
      type:'array',
      items:{ type:'string', maxLength:64 }
    },
    validFrom:{ type:'string', format:'date-time', maxLength:40 },
    validTo:{ type:'string', format:'date-time', maxLength:40 },
    logic:{ type:'object', additionalProperties:true },
    dsl:{ type:'string', maxLength:4000 }
  },
  required:['id','name','type','active']
};
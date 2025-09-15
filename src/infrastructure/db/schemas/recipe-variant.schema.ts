import { RxJsonSchema } from 'rxdb';

export interface RecipeVariant {
  id: string;
  recipeId: string;
  name: string;
  active: boolean;
  components: { ingredientId: string; qty: number }[];
  createdAt: string;
}

export const recipeVariantSchema: RxJsonSchema<RecipeVariant> = {
  title: 'recipe variant schema',
  version: 0,
  primaryKey: { key: 'id', fields: ['id'], separator: '|' },
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 64 },
    recipeId: { type: 'string', maxLength: 64 },
    name: { type: 'string', maxLength: 120 },
    active: { type: 'boolean' },
    components: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ingredientId: { type: 'string', maxLength: 64 },
          qty: { type: 'number', minimum: 0, multipleOf: 0.0001 }
        },
        required: ['ingredientId', 'qty']
      }
    },
    createdAt: { type: 'string', format: 'date-time', maxLength: 40 }
  },
  required: ['id', 'recipeId', 'name', 'active', 'components', 'createdAt']
};
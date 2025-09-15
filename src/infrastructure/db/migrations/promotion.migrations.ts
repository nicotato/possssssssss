import { promotionSchema } from '../../db/schemas/promotion.schema.ts';

export const promotionMigrationStrategies = {
  0: (doc: any) => {
    // v0 -> v1: introducción de stackable
    doc.stackable = doc.stackable ?? true;
    return doc;
  },
  1: (doc: any) => {
    // v1 -> v2: introducción de excludes / logic / dsl
    doc.excludes = doc.excludes || [];
    doc.logic = doc.logic || null;
    doc.dsl = doc.dsl || '';
    return doc;
  }
};

export const PROMOTION_SCHEMA = promotionSchema;
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { orderMigrationStrategies } from '../src/infrastructure/db/migrations/order.migrations.js';
import { promotionMigrationStrategies } from '../src/infrastructure/db/migrations/promotion.migrations.js';

function loadFixture(file:string) {
  return JSON.parse(
    fs.readFileSync(path.resolve('tests/fixtures', file), 'utf8')
  );
}

function migrate(docs:any[], from:number, to:number, strategies:any) {
  let current = docs;
  for(let v=from; v<to; v++) {
    const strat = strategies[v];
    if(strat) {
      current = current.map(d => strat({ ...d }));
    }
  }
  return current;
}

describe('Order migration strategies', () => {
  it('migrates v0 -> v7', () => {
    const docs = loadFixture('orders-v0.json');
    const out = migrate(docs, 0, 7, orderMigrationStrategies);
    const doc = out[0];
    expect(doc.invoicePrinted).toBeDefined();       // v0->v1
    expect(doc.appliedPromotions).toBeDefined();    // v2->v3
    expect(doc.branchId).toBeDefined();             // v3->v4
    expect(doc.costStdTotalBase).toBeDefined();     // v4->v5
    expect(doc.currencyUsed).toBeDefined();         // v5->v6
    expect(doc.paymentStatus).toBeDefined();        // v6->v7
  });

  it('migrates v3 -> v7', () => {
    const docs = loadFixture('orders-v3.json');
    const out = migrate(docs, 3, 7, orderMigrationStrategies);
    const doc = out[0];
    expect(doc.branchId).toBeDefined();
    expect(doc.costStdTotalBase).toBeDefined();
    expect(doc.currencyUsed).toBeDefined();
    expect(doc.paymentStatus).toBeDefined();
  });
});

describe('Promotion migration strategies', () => {
  it('migrates v0 -> v2', () => {
    const docs = loadFixture('promotions-v0.json');
    const out = migrate(docs, 0, 2, promotionMigrationStrategies);
    const doc = out[0];
    expect(doc.stackable).toBe(true);
    expect(doc.excludes).toBeDefined();
    expect(doc.logic).toBeDefined();
  });
});
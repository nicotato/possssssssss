#!/usr/bin/env ts-node
/**
 * CLI Dry-run Migration
 * Uso:
 *   npx ts-node scripts/migrations-dry-run.ts --collection orders --from 3 --to 7 --input ./fixtures/orders-v3.json
 * O sin input (genera documento mock)
 */

import fs from 'node:fs';
import path from 'node:path';
import minimist from 'minimist';

import { orderMigrationStrategies } from '../src/infrastructure/db/migrations/order.migrations.js';
import { promotionMigrationStrategies } from '../src/infrastructure/db/migrations/promotion.migrations.js';

interface StrategyMap {
  [v: number]: (d:any)=>any;
}

const known = {
  orders: orderMigrationStrategies,
  promotions: promotionMigrationStrategies
};

function loadInput(file?: string) {
  if (!file) return null;
  if (!fs.existsSync(file)) {
    throw new Error('Input file not found: ' + file);
  }
  return JSON.parse(fs.readFileSync(file,'utf8'));
}

function generateMock(collection:string, fromVersion:number) {
  if (collection === 'orders') {
    return [{
      id:'o_mock',
      createdAt: new Date().toISOString(),
      status:'completed',
      lines:[{ productId:'p1', name:'Prod', qty:1, unitPrice:100, lineTotal:100 }]
    }];
  }
  if (collection === 'promotions') {
    return [{
      id:'pr_mock',
      name:'Test Promo',
      type:'PERCENT_CART',
      active:true
    }];
  }
  return [{}];
}

function run() {
  const argv = minimist(process.argv.slice(2));
  const collection = argv.collection;
  const from = parseInt(argv.from,10);
  const to = parseInt(argv.to,10);
  const inputFile = argv.input;

  if(!collection || isNaN(from) || isNaN(to)) {
    console.log('Uso: --collection orders|promotions --from <n> --to <n> [--input file.json]');
    process.exit(1);
  }

  const strategies: StrategyMap = (known as any)[collection];
  if(!strategies) {
    console.log('Colección no soportada:', collection);
    process.exit(1);
  }

  let docs = loadInput(inputFile);
  if(!docs) {
    docs = generateMock(collection, from);
    console.log('(INFO) Usando mock docs generados');
  }

  console.log(`Dry-run migrando ${docs.length} documentos de v${from} -> v${to}`);
  for (let i=from; i<to; i++) {
    const strat = strategies[i];
    if(!strat) {
      console.log(`(WARN) No strategy para paso v${i} -> v${i+1}, se deja igual`);
      continue;
    }
    docs = docs.map((d:any) => strat({ ...d }));
  }

  // Validaciones básicas
  const invalid = docs.filter((d:any)=> !d.id);
  if (invalid.length) {
    console.log('(ERROR) Documentos sin id tras migración.');
    process.exit(2);
  }

  console.log('(OK) Migración simulada. Muestra primer doc resultante:\n', docs[0]);
}

run();
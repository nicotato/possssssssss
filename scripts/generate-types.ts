/**
 * Script placeholder:
 * - Leer carpeta schemas
 * - Por cada schema *.schema.ts ya definimos interface a mano (más preciso)
 * Si usas JSON puros: parsear y generar strings.
 * Este ejemplo asume ya usas interfaces en los .ts -> no hace nada complejo
 */
import fs from 'node:fs';
import path from 'node:path';

const schemasDir = path.resolve('src/infrastructure/db/schemas');
const out = path.resolve('src/domain/generated-types.d.ts');

const files = fs.readdirSync(schemasDir).filter(f=>f.endsWith('.schema.ts'));

let content = `// AUTO-GENERATED - DO NOT EDIT MANUALLY\n`;

files.forEach(f => {
  // Estrategia simple: buscar "export interface"
  const full = fs.readFileSync(path.join(schemasDir,f),'utf8');
  const matches = full.match(/export interface [\s\S]*?\n}\n/g);
  if(matches) {
    matches.forEach(m => content += m + '\n');
  }
});

fs.writeFileSync(out, content, 'utf8');
console.log('Generated', out);
/**
 * Orval emite sintaxis de Zod 4 (`zod.uuid()`, `zod.int()`, `record` con dos
 * argumentos) pero importa la raíz del paquete, que en zod 3.25 sigue siendo
 * la API v3. El workspace usa `zod/v4`, así que reescribimos el import.
 *
 * Corre como paso del `codegen`: si se regenera, el ajuste se vuelve a aplicar.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..', 'api-zod', 'src', 'generated');
const archivos = globSync('**/*.ts', { cwd: raiz }).map((f) => path.join(raiz, f));

let tocados = 0;
for (const archivo of archivos) {
  const original = readFileSync(archivo, 'utf8');
  const ajustado = original.replace(/from ['"]zod['"]/g, "from 'zod/v4'");
  if (ajustado !== original) {
    writeFileSync(archivo, ajustado);
    tocados += 1;
  }
}

console.log(`import de zod ajustado a zod/v4 en ${tocados} archivo(s)`);

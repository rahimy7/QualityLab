/**
 * Seed: inserta o actualiza los casos del laboratorio en la tabla `casos`.
 *
 * Lee los objetos Caso desde los módulos TypeScript del bundle qualitylab, así
 * que agregar un caso nuevo es crear el archivo en `artifacts/qualitylab/src/
 * data/casos/<id>/` e importarlo aquí.
 */
import { db, pool, casosTable } from '../index';
import { sql } from 'drizzle-orm';
import { casoAndina } from '../../../../artifacts/qualitylab/src/data/casos/andina';
import { casoPintura } from '../../../../artifacts/qualitylab/src/data/casos/pintura';
import { casoTrionda } from '../../../../artifacts/qualitylab/src/data/casos/trionda';

const semilla = [
  { orden: 10, caso: casoAndina },
  { orden: 20, caso: casoPintura },
  { orden: 30, caso: casoTrionda },
];

async function seed(): Promise<void> {
  console.log(`Sembrando ${semilla.length} casos…`);
  for (const { orden, caso } of semilla) {
    await db
      .insert(casosTable)
      .values({ id: caso.id, contenido: caso, orden, activo: true })
      .onConflictDoUpdate({
        target: casosTable.id,
        set: {
          contenido: caso,
          orden,
          activo: true,
          actualizadoEn: sql`now()`,
        },
      });
    console.log(`  · ${caso.id.padEnd(10)} — ${caso.nombreCorto}`);
  }
  console.log('OK: casos sembrados.');
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exitCode = 1;
  pool.end().catch(() => {});
});

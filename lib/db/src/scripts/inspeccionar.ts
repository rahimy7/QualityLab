/**
 * Inspecciona conteos y detecta duplicados que impidan aplicar constraints.
 * No modifica nada, solo reporta.
 */
import { db, pool } from '../index';
import { sql } from 'drizzle-orm';

async function main(): Promise<void> {
  const tablas = ['sesiones', 'participantes', 'avances', 'respuestas', 'casos', 'grupos_avances'];
  for (const t of tablas) {
    const r = await db.execute(sql.raw(`SELECT count(*)::int AS n FROM ${t}`));
    console.log(`${t.padEnd(18)} ${(r.rows[0] as { n: number }).n} filas`);
  }
  console.log('\nDuplicados en respuestas (participante_id, pregunta_id):');
  const dup = await db.execute(sql`
    SELECT participante_id, pregunta_id, count(*)::int AS n
    FROM respuestas
    GROUP BY participante_id, pregunta_id
    HAVING count(*) > 1
    ORDER BY n DESC
  `);
  if (dup.rows.length === 0) {
    console.log('  (ninguno)');
  } else {
    for (const row of dup.rows) console.log(' ', row);
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
  pool.end().catch(() => {});
});

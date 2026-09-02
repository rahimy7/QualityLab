/**
 * Migración manual mínima: crea las tablas `casos` y `grupos_avances` sin
 * tocar el resto del esquema. Se usa `IF NOT EXISTS` para poder correrla
 * varias veces sin efecto.
 */
import { db, pool } from '../index';
import { sql } from 'drizzle-orm';

async function migrar(): Promise<void> {
  console.log('Aplicando migraciones incrementales…');

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS casos (
      id text PRIMARY KEY,
      contenido jsonb NOT NULL,
      orden integer NOT NULL DEFAULT 0,
      activo boolean NOT NULL DEFAULT true,
      actualizado_en timestamptz NOT NULL DEFAULT now()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS grupos_avances (
      grupo_id text NOT NULL,
      caso_id text NOT NULL,
      dispositivo_id text NOT NULL,
      nombre text NOT NULL DEFAULT '',
      contenido jsonb NOT NULL,
      actualizado_en timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (grupo_id, caso_id, dispositivo_id)
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS grupos_avances_grupo_idx
    ON grupos_avances (grupo_id, caso_id);
  `);

  console.log('OK: casos y grupos_avances listas.');
  await pool.end();
}

migrar().catch((err) => {
  console.error(err);
  process.exitCode = 1;
  pool.end().catch(() => {});
});

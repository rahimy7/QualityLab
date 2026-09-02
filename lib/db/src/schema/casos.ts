import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

/**
 * Un caso del laboratorio: empresa, indicadores, series, incidencias, quizzes,
 * teoría, coach, auditoría, misiones, roles de entrevista y video.
 *
 * `contenido` guarda el objeto Caso completo como JSONB. La forma exacta la
 * define `Caso` en el frontend (artifacts/qualitylab/src/data/casos/tipos.ts);
 * aquí es opaco a propósito: cambiar el shape no requiere migración.
 */
export const casosTable = pgTable('casos', {
  id: text('id').primaryKey(),
  contenido: jsonb('contenido').notNull(),
  orden: integer('orden').notNull().default(0),
  activo: boolean('activo').notNull().default(true),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
});

export const insertCasoSchema = createInsertSchema(casosTable).omit({
  actualizadoEn: true,
});

export type InsertCaso = z.infer<typeof insertCasoSchema>;
export type Caso = typeof casosTable.$inferSelect;

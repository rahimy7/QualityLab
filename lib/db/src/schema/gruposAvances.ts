import { index, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

/**
 * Avance individual etiquetado por grupo predefinido (Kaizen, Six Sigma, etc.)
 * y por caso. Cada dispositivo tiene su propio registro por (grupo, caso).
 *
 * A diferencia de `avances` (sesiones creadas por el facilitador), esta tabla
 * no requiere una sesión activa: al entrar el participante elige su grupo y
 * su avance se guarda de inmediato, para que el facilitador pueda revisar en
 * cualquier momento el trabajo agregado por equipo.
 */
export const gruposAvancesTable = pgTable(
  'grupos_avances',
  {
    grupoId: text('grupo_id').notNull(),
    casoId: text('caso_id').notNull(),
    dispositivoId: text('dispositivo_id').notNull(),
    nombre: text('nombre').notNull().default(''),
    contenido: jsonb('contenido').notNull(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.grupoId, t.casoId, t.dispositivoId] }),
    index('grupos_avances_grupo_idx').on(t.grupoId, t.casoId),
  ],
);

export const insertGrupoAvanceSchema = createInsertSchema(gruposAvancesTable).omit({
  actualizadoEn: true,
});

export type InsertGrupoAvance = z.infer<typeof insertGrupoAvanceSchema>;
export type GrupoAvance = typeof gruposAvancesTable.$inferSelect;

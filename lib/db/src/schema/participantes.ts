import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { sesionesTable } from './sesiones';

/**
 * Un participante dentro de una sesión.
 *
 * `dispositivoId` lo genera el navegador la primera vez y vive en localStorage:
 * identifica el aparato sin pedir contraseña. Si alguien cambia de teléfono,
 * se vuelve a unir con el código de sesión y su nombre, y el servidor le
 * devuelve el avance que ya tenía.
 */
export const participantesTable = pgTable(
  'participantes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sesionId: uuid('sesion_id')
      .notNull()
      .references(() => sesionesTable.id, { onDelete: 'cascade' }),
    dispositivoId: text('dispositivo_id').notNull(),
    nombre: text('nombre').notNull(),
    equipoId: text('equipo_id').notNull(),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    vistoEn: timestamp('visto_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('participantes_sesion_dispositivo_uq').on(t.sesionId, t.dispositivoId),
    index('participantes_sesion_idx').on(t.sesionId),
  ],
);

export const insertParticipanteSchema = createInsertSchema(participantesTable).omit({
  id: true,
  creadoEn: true,
  vistoEn: true,
});

export type InsertParticipante = z.infer<typeof insertParticipanteSchema>;
export type Participante = typeof participantesTable.$inferSelect;

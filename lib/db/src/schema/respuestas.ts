import { boolean, index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { participantesTable } from './participantes';

/**
 * Una fila por ejercicio respondido.
 *
 * Va aparte del avance porque responde una pregunta distinta: no "cómo va esta
 * persona" sino "qué entendió el aula". Con esto el facilitador ve, pregunta
 * por pregunta, dónde se equivocó la mayoría y qué conviene retomar.
 */
export const respuestasTable = pgTable(
  'respuestas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    participanteId: uuid('participante_id')
      .notNull()
      .references(() => participantesTable.id, { onDelete: 'cascade' }),
    preguntaId: text('pregunta_id').notNull(),
    opcionId: text('opcion_id').notNull(),
    correcta: boolean('correcta').notNull(),
    respondidaEn: timestamp('respondida_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('respuestas_participante_pregunta_uq').on(t.participanteId, t.preguntaId),
    index('respuestas_pregunta_idx').on(t.preguntaId),
  ],
);

export const insertRespuestaSchema = createInsertSchema(respuestasTable).omit({
  id: true,
  respondidaEn: true,
});

export type InsertRespuesta = z.infer<typeof insertRespuestaSchema>;
export type Respuesta = typeof respuestasTable.$inferSelect;

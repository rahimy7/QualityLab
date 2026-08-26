import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { participantesTable } from './participantes';

/**
 * Instantánea del avance de un participante: una fila por persona.
 *
 * `estado` guarda el estado completo del cliente para poder restaurarlo tal
 * cual en otro dispositivo. Las columnas de al lado están desnormalizadas a
 * propósito: el tablero del facilitador se refresca cada pocos segundos con
 * toda el aula y no debe tener que abrir el JSON de cada participante.
 */
export const avancesTable = pgTable('avances', {
  participanteId: uuid('participante_id')
    .primaryKey()
    .references(() => participantesTable.id, { onDelete: 'cascade' }),
  puntos: integer('puntos').notNull().default(0),
  misiones: text('misiones').array().notNull().default([]),
  logros: text('logros').array().notNull().default([]),
  respondidas: integer('respondidas').notNull().default(0),
  aciertos: integer('aciertos').notNull().default(0),
  /** Estado íntegro del cliente, para restaurar la sesión sin pérdidas. */
  estado: jsonb('estado').notNull(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
});

export const insertAvanceSchema = createInsertSchema(avancesTable).omit({
  actualizadoEn: true,
});

export type InsertAvance = z.infer<typeof insertAvanceSchema>;
export type Avance = typeof avancesTable.$inferSelect;

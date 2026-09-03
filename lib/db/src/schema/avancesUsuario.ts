import { jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { usuariosTable } from './usuarios';

/**
 * Avance de una cuenta en un caso: una fila por (usuario, caso).
 *
 * Sustituye a las dos formas anteriores de guardar en el servidor —el código de
 * sesión y la etiqueta por dispositivo—, que identificaban al participante por
 * el aparato y por eso no podían devolverle su trabajo en otro teléfono.
 *
 * El grupo no se guarda aquí: se lee del perfil del usuario, así que cambiar de
 * equipo mueve todo su avance sin dejar filas huérfanas en el equipo anterior.
 */
export const avancesUsuarioTable = pgTable(
  'avances_usuario',
  {
    usuarioId: uuid('usuario_id')
      .notNull()
      .references(() => usuariosTable.id, { onDelete: 'cascade' }),
    casoId: text('caso_id').notNull(),
    contenido: jsonb('contenido').notNull(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.casoId] })],
);

export const insertAvanceUsuarioSchema = createInsertSchema(avancesUsuarioTable).omit({
  actualizadoEn: true,
});

export type InsertAvanceUsuario = z.infer<typeof insertAvanceUsuarioSchema>;
export type AvanceUsuario = typeof avancesUsuarioTable.$inferSelect;

import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

/**
 * Una sesión es una impartición del módulo: un aula, una fecha, un grupo.
 *
 * El facilitador la crea y comparte el `codigo` (por QR o dictándolo). No hay
 * cuentas: el código es la única llave que necesita el participante para unirse
 * y para recuperar su avance si cambia de dispositivo.
 */
export const sesionesTable = pgTable(
  'sesiones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Código corto que se dicta en voz alta: sin caracteres ambiguos. */
    codigo: text('codigo').notNull().unique(),
    nombre: text('nombre').notNull(),
    facilitador: text('facilitador'),
    activa: boolean('activa').notNull().default(true),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sesiones_codigo_idx').on(t.codigo)],
);

export const insertSesionSchema = createInsertSchema(sesionesTable).omit({
  id: true,
  creadaEn: true,
});

export type InsertSesion = z.infer<typeof insertSesionSchema>;
export type Sesion = typeof sesionesTable.$inferSelect;

/**
 * Alfabeto sin 0/O ni 1/I/L: el código se dicta en voz alta en un aula y se
 * teclea en un celular, donde una confusión cuesta más que un carácter extra.
 */
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generarCodigoSesion(longitud = 6): string {
  let salida = '';
  for (let i = 0; i < longitud; i += 1) {
    salida += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return salida;
}

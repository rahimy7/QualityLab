import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

/**
 * Cuenta de un participante.
 *
 * El correo es el identificador y se guarda en minúsculas para que "Ana@x.com"
 * y "ana@x.com" no sean dos cuentas distintas. No se verifica por correo porque
 * el proyecto no tiene servidor de envío: sirve para recuperar la cuenta desde
 * otro dispositivo, que es lo que el módulo necesita.
 *
 * `grupoId` es el equipo del aula y vive aquí, en el perfil, no en el avance:
 * una persona pertenece a un equipo, no a un equipo por caso.
 */
export const usuariosTable = pgTable(
  'usuarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    nombre: text('nombre').notNull(),
    grupoId: text('grupo_id').notNull(),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('usuarios_email_uq').on(t.email)],
);

/**
 * Sesión abierta de una cuenta.
 *
 * Se guarda el SHA-256 del token, nunca el token en claro: si alguien llegara a
 * leer la tabla no obtendría credenciales utilizables, igual que con las
 * contraseñas. El token real solo existe en la cookie del navegador.
 */
export const sesionesUsuarioTable = pgTable(
  'sesiones_usuario',
  {
    tokenHash: text('token_hash').primaryKey(),
    usuarioId: uuid('usuario_id')
      .notNull()
      .references(() => usuariosTable.id, { onDelete: 'cascade' }),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    expiraEn: timestamp('expira_en', { withTimezone: true }).notNull(),
  },
  (t) => [index('sesiones_usuario_usuario_idx').on(t.usuarioId)],
);

export const insertUsuarioSchema = createInsertSchema(usuariosTable).omit({
  id: true,
  creadoEn: true,
  actualizadoEn: true,
});

export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type Usuario = typeof usuariosTable.$inferSelect;
export type SesionUsuario = typeof sesionesUsuarioTable.$inferSelect;

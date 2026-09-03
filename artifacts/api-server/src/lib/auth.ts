/**
 * Sesiones de cuenta.
 *
 * El navegador guarda un token opaco en una cookie httpOnly; el servidor guarda
 * solo su SHA-256. Se prefiere esto a un JWT porque permite cerrar sesión de
 * verdad: basta borrar la fila, mientras que un JWT sigue siendo válido hasta
 * que expira.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { and, eq, gt, lt } from 'drizzle-orm';
import { db, sesionesUsuarioTable, usuariosTable, type Usuario } from '@workspace/db';
import { ErrorHttp } from './errores';

export const COOKIE_SESION = 'ql_sesion';
const DIAS_VALIDEZ = 30;

/** Lo que se le devuelve al cliente: nunca el hash de la contraseña. */
export interface UsuarioPublico {
  id: string;
  email: string;
  nombre: string;
  grupoId: string;
}

export function publico(u: Usuario): UsuarioPublico {
  return { id: u.id, email: u.email, nombre: u.nombre, grupoId: u.grupoId };
}

function hashDeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function abrirSesion(res: Response, usuarioId: string): Promise<void> {
  const token = randomBytes(32).toString('hex');
  const expiraEn = new Date(Date.now() + DIAS_VALIDEZ * 24 * 60 * 60 * 1000);

  await db.insert(sesionesUsuarioTable).values({
    tokenHash: hashDeToken(token),
    usuarioId,
    expiraEn,
  });

  // Las sesiones vencidas no estorban a nadie, pero tampoco tiene sentido
  // acumularlas: se limpian al vuelo cada vez que alguien entra.
  await db.delete(sesionesUsuarioTable).where(lt(sesionesUsuarioTable.expiraEn, new Date()));

  res.cookie(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiraEn,
    path: '/',
  });
}

export async function cerrarSesion(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[COOKIE_SESION];
  if (typeof token === 'string' && token) {
    await db.delete(sesionesUsuarioTable).where(eq(sesionesUsuarioTable.tokenHash, hashDeToken(token)));
  }
  res.clearCookie(COOKIE_SESION, { path: '/' });
}

/** Usuario de la cookie, o null si no hay sesión válida. */
export async function usuarioDeLaPeticion(req: Request): Promise<Usuario | null> {
  const token = req.cookies?.[COOKIE_SESION];
  if (typeof token !== 'string' || !token) return null;

  const [fila] = await db
    .select({ usuario: usuariosTable })
    .from(sesionesUsuarioTable)
    .innerJoin(usuariosTable, eq(usuariosTable.id, sesionesUsuarioTable.usuarioId))
    .where(
      and(
        eq(sesionesUsuarioTable.tokenHash, hashDeToken(token)),
        gt(sesionesUsuarioTable.expiraEn, new Date()),
      ),
    )
    .limit(1);

  return fila?.usuario ?? null;
}

export async function exigirUsuario(req: Request): Promise<Usuario> {
  const usuario = await usuarioDeLaPeticion(req);
  if (!usuario) throw new ErrorHttp(401, 'Necesitas iniciar sesión');
  return usuario;
}

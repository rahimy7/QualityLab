/**
 * Cuentas: registro, entrada, salida y perfil.
 *
 * El correo identifica la cuenta y el grupo vive en el perfil, así que el
 * facilitador puede revisar por equipo sin depender del aparato desde el que
 * cada quien trabaje.
 */
import { Router, type IRouter } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';
import { db, usuariosTable, esGrupoValido, grupos } from '@workspace/db';
import { asyncHandler, ErrorHttp } from '../lib/errores';
import { hashearPassword, verificarPassword } from '../lib/password';
import { abrirSesion, cerrarSesion, exigirUsuario, publico, usuarioDeLaPeticion } from '../lib/auth';

const router: IRouter = Router();

// Comprobación deliberadamente laxa: aquí el correo es un identificador que la
// persona debe poder recordar, no un canal que vayamos a usar para escribirle.
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const correo = z
  .string()
  .min(5)
  .max(160)
  .transform((v) => v.trim().toLowerCase())
  .refine((v) => FORMATO_CORREO.test(v), 'El correo no tiene un formato válido');

const password = z.string().min(8, 'La contraseña necesita al menos 8 caracteres').max(200);
const nombre = z.string().min(2, 'Escribe tu nombre').max(120).transform((v) => v.trim());

const esquemaRegistro = z.object({
  email: correo,
  password,
  nombre,
  grupoId: z.string().min(1).max(60),
});

const esquemaEntrada = z.object({ email: correo, password: z.string().min(1).max(200) });

const esquemaPerfil = z.object({
  nombre: nombre.optional(),
  grupoId: z.string().min(1).max(60).optional(),
});

function exigirGrupo(grupoId: string): void {
  if (!esGrupoValido(grupoId)) {
    throw new ErrorHttp(400, `El equipo "${grupoId}" no existe`);
  }
}

router.post(
  '/auth/registro',
  asyncHandler(async (req, res) => {
    const datos = esquemaRegistro.parse(req.body);
    exigirGrupo(datos.grupoId);

    const [existente] = await db
      .select({ id: usuariosTable.id })
      .from(usuariosTable)
      .where(eq(usuariosTable.email, datos.email))
      .limit(1);
    if (existente) throw new ErrorHttp(409, 'Ya hay una cuenta con ese correo');

    const [usuario] = await db
      .insert(usuariosTable)
      .values({
        email: datos.email,
        passwordHash: await hashearPassword(datos.password),
        nombre: datos.nombre,
        grupoId: datos.grupoId,
      })
      .returning();

    await abrirSesion(res, usuario.id);
    res.status(201).json(publico(usuario));
  }),
);

router.post(
  '/auth/entrar',
  asyncHandler(async (req, res) => {
    const datos = esquemaEntrada.parse(req.body);

    const [usuario] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.email, datos.email))
      .limit(1);

    // El mismo mensaje para correo inexistente y contraseña incorrecta: decir
    // cuál de los dos falló revela qué correos tienen cuenta.
    const invalido = new ErrorHttp(401, 'Correo o contraseña incorrectos');
    if (!usuario) throw invalido;
    if (!(await verificarPassword(datos.password, usuario.passwordHash))) throw invalido;

    await abrirSesion(res, usuario.id);
    res.json(publico(usuario));
  }),
);

router.post(
  '/auth/salir',
  asyncHandler(async (req, res) => {
    await cerrarSesion(req, res);
    res.json({ ok: true });
  }),
);

router.get(
  '/auth/yo',
  asyncHandler(async (req, res) => {
    const usuario = await usuarioDeLaPeticion(req);
    if (!usuario) {
      // 204 y no 401: preguntar "¿quién soy?" sin sesión es una respuesta
      // legítima, no un error que deba pintarse en la consola del navegador.
      res.status(204).send();
      return;
    }
    res.json(publico(usuario));
  }),
);

router.patch(
  '/auth/perfil',
  asyncHandler(async (req, res) => {
    const usuario = await exigirUsuario(req);
    const datos = esquemaPerfil.parse(req.body);
    if (datos.grupoId) exigirGrupo(datos.grupoId);

    const [actualizado] = await db
      .update(usuariosTable)
      .set({
        ...(datos.nombre ? { nombre: datos.nombre } : {}),
        ...(datos.grupoId ? { grupoId: datos.grupoId } : {}),
        actualizadoEn: new Date(),
      })
      .where(eq(usuariosTable.id, usuario.id))
      .returning();

    res.json(publico(actualizado));
  }),
);

/** Catálogo de equipos, para pintar el selector del registro. */
router.get(
  '/auth/equipos',
  asyncHandler(async (_req, res) => {
    res.json(grupos);
  }),
);

export default router;

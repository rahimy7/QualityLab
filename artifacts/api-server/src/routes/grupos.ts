/**
 * Revisión por grupo para el facilitador.
 *
 * Lee las cuentas y su avance: el grupo sale del perfil del usuario, así que
 * alguien que cambia de equipo se lleva todo su trabajo consigo.
 *
 * Ojo: estas rutas no exigen sesión, a propósito, para que el facilitador pueda
 * abrir la pantalla sin cuenta. Por eso NO devuelven el correo de nadie: sería
 * exponer datos personales en un endpoint público.
 */
import { Router, type IRouter } from 'express';
import { desc, eq, sql } from 'drizzle-orm';
import { db, grupos, esGrupoValido, usuariosTable, avancesUsuarioTable } from '@workspace/db';
import { asyncHandler, noEncontrado, ErrorHttp } from '../lib/errores';

const router: IRouter = Router();

function entradaInvalida(mensaje: string): ErrorHttp {
  return new ErrorHttp(400, mensaje);
}

router.get(
  '/grupos',
  asyncHandler(async (_req, res) => {
    // Inscritos y actividad son dos preguntas distintas: alguien puede haberse
    // registrado en un equipo y no haber trabajado todavía, y el facilitador
    // necesita ver justamente eso.
    const [inscritos, porCasoStats] = await Promise.all([
      db
        .select({
          grupoId: usuariosTable.grupoId,
          inscritos: sql<number>`count(*)`.mapWith(Number),
        })
        .from(usuariosTable)
        .groupBy(usuariosTable.grupoId),
      db
        .select({
          grupoId: usuariosTable.grupoId,
          casoId: avancesUsuarioTable.casoId,
          participantes: sql<number>`count(distinct ${avancesUsuarioTable.usuarioId})`.mapWith(Number),
          actualizadoEn: sql<Date>`max(${avancesUsuarioTable.actualizadoEn})`,
        })
        .from(avancesUsuarioTable)
        .innerJoin(usuariosTable, eq(usuariosTable.id, avancesUsuarioTable.usuarioId))
        .groupBy(usuariosTable.grupoId, avancesUsuarioTable.casoId),
    ]);

    const porGrupo = new Map<
      string,
      { participantes: number; actividad: Date | null; porCaso: Record<string, number> }
    >();
    for (const g of grupos) porGrupo.set(g.id, { participantes: 0, actividad: null, porCaso: {} });

    for (const i of inscritos) {
      const entrada = porGrupo.get(i.grupoId);
      if (entrada) entrada.participantes = i.inscritos;
    }
    for (const s of porCasoStats) {
      const entrada = porGrupo.get(s.grupoId);
      if (!entrada) continue;
      entrada.porCaso[s.casoId] = s.participantes;
      const cuando = s.actualizadoEn ? new Date(s.actualizadoEn) : null;
      if (cuando && (!entrada.actividad || cuando > entrada.actividad)) entrada.actividad = cuando;
    }

    res.json(
      grupos.map((g) => ({
        ...g,
        participantes: porGrupo.get(g.id)?.participantes ?? 0,
        actualizadoEn: porGrupo.get(g.id)?.actividad?.toISOString() ?? null,
        porCaso: porGrupo.get(g.id)?.porCaso ?? {},
      })),
    );
  }),
);

/**
 * Proyección ligera de toda el aula: solo los tres campos con los que se
 * calculan los Quality Points. Evita bajar el estado completo de cada
 * participante para pintar la lista de grupos.
 */
router.get(
  '/grupos/avances',
  asyncHandler(async (req, res) => {
    const casoId = req.query.casoId ? String(req.query.casoId).trim() : null;

    const filas = await db
      .select({
        grupoId: usuariosTable.grupoId,
        casoId: avancesUsuarioTable.casoId,
        usuarioId: avancesUsuarioTable.usuarioId,
        nombre: usuariosTable.nombre,
        misiones: sql<unknown>`${avancesUsuarioTable.contenido} -> 'misiones'`,
        quiz: sql<unknown>`${avancesUsuarioTable.contenido} -> 'quiz'`,
        logros: sql<unknown>`${avancesUsuarioTable.contenido} -> 'logros'`,
        actualizadoEn: avancesUsuarioTable.actualizadoEn,
      })
      .from(avancesUsuarioTable)
      .innerJoin(usuariosTable, eq(usuariosTable.id, avancesUsuarioTable.usuarioId))
      .where(casoId ? eq(avancesUsuarioTable.casoId, casoId) : undefined)
      .orderBy(desc(avancesUsuarioTable.actualizadoEn));

    res.json(
      filas.map((f) => ({
        grupoId: f.grupoId,
        casoId: f.casoId,
        usuarioId: f.usuarioId,
        nombre: f.nombre,
        misiones: Array.isArray(f.misiones) ? f.misiones : [],
        quiz: f.quiz && typeof f.quiz === 'object' && !Array.isArray(f.quiz) ? f.quiz : {},
        logros: Array.isArray(f.logros) ? f.logros : [],
        actualizadoEn: f.actualizadoEn.toISOString(),
      })),
    );
  }),
);

router.get(
  '/grupos/:grupoId/avances',
  asyncHandler(async (req, res) => {
    const grupoId = String(req.params.grupoId);
    if (!esGrupoValido(grupoId)) throw noEncontrado(`Grupo ${grupoId} no existe`);
    const casoId = req.query.casoId ? String(req.query.casoId).trim() : null;

    const filas = await db
      .select({
        casoId: avancesUsuarioTable.casoId,
        usuarioId: avancesUsuarioTable.usuarioId,
        nombre: usuariosTable.nombre,
        contenido: avancesUsuarioTable.contenido,
        actualizadoEn: avancesUsuarioTable.actualizadoEn,
      })
      .from(avancesUsuarioTable)
      .innerJoin(usuariosTable, eq(usuariosTable.id, avancesUsuarioTable.usuarioId))
      .where(
        casoId
          ? sql`${usuariosTable.grupoId} = ${grupoId} and ${avancesUsuarioTable.casoId} = ${casoId}`
          : eq(usuariosTable.grupoId, grupoId),
      )
      .orderBy(desc(avancesUsuarioTable.actualizadoEn));

    res.json(
      filas.map((f) => ({
        casoId: f.casoId,
        usuarioId: f.usuarioId,
        nombre: f.nombre,
        contenido: f.contenido,
        actualizadoEn: f.actualizadoEn.toISOString(),
      })),
    );
  }),
);

/** Miembros del grupo, hayan trabajado o no. */
router.get(
  '/grupos/:grupoId/miembros',
  asyncHandler(async (req, res) => {
    const grupoId = String(req.params.grupoId);
    if (!esGrupoValido(grupoId)) throw noEncontrado(`Grupo ${grupoId} no existe`);

    const filas = await db
      .select({ id: usuariosTable.id, nombre: usuariosTable.nombre, creadoEn: usuariosTable.creadoEn })
      .from(usuariosTable)
      .where(eq(usuariosTable.grupoId, grupoId))
      .orderBy(usuariosTable.nombre);

    res.json(filas.map((f) => ({ ...f, creadoEn: f.creadoEn.toISOString() })));
  }),
);

export { entradaInvalida };
export default router;

/**
 * Grupos predefinidos y avance individual etiquetado por grupo.
 *
 * Cada participante trabaja su propia copia del caso (avance INDIVIDUAL); el
 * grupo es solo una etiqueta que permite al facilitador revisar el conjunto.
 */
import { Router, type IRouter } from 'express';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, grupos, esGrupoValido, gruposAvancesTable } from '@workspace/db';
import { asyncHandler, noEncontrado, ErrorHttp } from '../lib/errores';

const router: IRouter = Router();

function entradaInvalida(mensaje: string): ErrorHttp {
  return new ErrorHttp(400, mensaje);
}

router.get(
  '/grupos',
  asyncHandler(async (_req, res) => {
    // Dos agregados distintos: el total del grupo se cuenta sobre dispositivos
    // DISTINTOS del grupo entero, no sumando los de cada caso — quien trabaja
    // dos casos es un solo participante, aunque tenga dos filas.
    const [porCasoStats, porGrupoStats] = await Promise.all([
      db
        .select({
          grupoId: gruposAvancesTable.grupoId,
          casoId: gruposAvancesTable.casoId,
          participantes: sql<number>`count(distinct ${gruposAvancesTable.dispositivoId})`.mapWith(Number),
        })
        .from(gruposAvancesTable)
        .groupBy(gruposAvancesTable.grupoId, gruposAvancesTable.casoId),
      db
        .select({
          grupoId: gruposAvancesTable.grupoId,
          participantes: sql<number>`count(distinct ${gruposAvancesTable.dispositivoId})`.mapWith(Number),
          actualizadoEn: sql<Date>`max(${gruposAvancesTable.actualizadoEn})`,
        })
        .from(gruposAvancesTable)
        .groupBy(gruposAvancesTable.grupoId),
    ]);

    const porGrupo = new Map<string, { participantes: number; actividad: Date | null; porCaso: Record<string, number> }>();
    for (const g of grupos) porGrupo.set(g.id, { participantes: 0, actividad: null, porCaso: {} });
    for (const s of porCasoStats) {
      const entry = porGrupo.get(s.grupoId);
      if (entry) entry.porCaso[s.casoId] = s.participantes;
    }
    for (const s of porGrupoStats) {
      const entry = porGrupo.get(s.grupoId);
      if (!entry) continue;
      entry.participantes = s.participantes;
      entry.actividad = s.actualizadoEn ? new Date(s.actualizadoEn) : null;
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
 * Proyección ligera de TODOS los grupos: solo los tres campos con los que se
 * calculan los Quality Points (misiones, quiz y logros). Evita bajar el estado
 * completo de cada participante para pintar la lista de grupos, que en un aula
 * de 30 personas serían cientos de KB de JSON que nadie mira.
 */
router.get(
  '/grupos/avances',
  asyncHandler(async (req, res) => {
    const casoId = req.query.casoId ? String(req.query.casoId).trim() : null;

    const filas = await db
      .select({
        grupoId: gruposAvancesTable.grupoId,
        casoId: gruposAvancesTable.casoId,
        dispositivoId: gruposAvancesTable.dispositivoId,
        nombre: gruposAvancesTable.nombre,
        misiones: sql<unknown>`${gruposAvancesTable.contenido} -> 'misiones'`,
        quiz: sql<unknown>`${gruposAvancesTable.contenido} -> 'quiz'`,
        logros: sql<unknown>`${gruposAvancesTable.contenido} -> 'logros'`,
        actualizadoEn: gruposAvancesTable.actualizadoEn,
      })
      .from(gruposAvancesTable)
      .where(casoId ? eq(gruposAvancesTable.casoId, casoId) : undefined)
      .orderBy(desc(gruposAvancesTable.actualizadoEn));

    res.json(
      filas.map((f) => ({
        grupoId: f.grupoId,
        casoId: f.casoId,
        dispositivoId: f.dispositivoId,
        nombre: f.nombre,
        misiones: Array.isArray(f.misiones) ? f.misiones : [],
        quiz: f.quiz && typeof f.quiz === 'object' && !Array.isArray(f.quiz) ? f.quiz : {},
        logros: Array.isArray(f.logros) ? f.logros : [],
        actualizadoEn: f.actualizadoEn.toISOString(),
      })),
    );
  }),
);

const esquemaGuardado = z.object({
  casoId: z.string().min(1).max(60),
  dispositivoId: z.string().min(1).max(120),
  nombre: z.string().max(120).default(''),
  contenido: z.record(z.string(), z.unknown()),
});

router.put(
  '/grupos/:grupoId/avance',
  asyncHandler(async (req, res) => {
    const grupoId = String(req.params.grupoId);
    if (!esGrupoValido(grupoId)) throw noEncontrado(`Grupo ${grupoId} no existe`);

    const parse = esquemaGuardado.safeParse(req.body);
    if (!parse.success) throw entradaInvalida(`cuerpo-invalido: ${parse.error.message}`);
    const cuerpo = parse.data;

    const [guardado] = await db
      .insert(gruposAvancesTable)
      .values({
        grupoId,
        casoId: cuerpo.casoId,
        dispositivoId: cuerpo.dispositivoId,
        nombre: cuerpo.nombre,
        contenido: cuerpo.contenido,
      })
      .onConflictDoUpdate({
        target: [gruposAvancesTable.grupoId, gruposAvancesTable.casoId, gruposAvancesTable.dispositivoId],
        set: {
          nombre: cuerpo.nombre,
          contenido: cuerpo.contenido,
          actualizadoEn: sql`now()`,
        },
      })
      .returning({ actualizadoEn: gruposAvancesTable.actualizadoEn });

    res.json({ ok: true, actualizadoEn: guardado.actualizadoEn.toISOString() });
  }),
);

router.get(
  '/grupos/:grupoId/avance',
  asyncHandler(async (req, res) => {
    const grupoId = String(req.params.grupoId);
    if (!esGrupoValido(grupoId)) throw noEncontrado(`Grupo ${grupoId} no existe`);
    const casoId = String(req.query.casoId ?? '').trim();
    const dispositivoId = String(req.query.dispositivoId ?? '').trim();
    if (!casoId || !dispositivoId) throw entradaInvalida('casoId y dispositivoId son obligatorios');

    const [row] = await db
      .select()
      .from(gruposAvancesTable)
      .where(
        and(
          eq(gruposAvancesTable.grupoId, grupoId),
          eq(gruposAvancesTable.casoId, casoId),
          eq(gruposAvancesTable.dispositivoId, dispositivoId),
        ),
      )
      .limit(1);

    if (!row) {
      res.status(204).send();
      return;
    }
    res.json({
      grupoId: row.grupoId,
      casoId: row.casoId,
      dispositivoId: row.dispositivoId,
      nombre: row.nombre,
      contenido: row.contenido,
      actualizadoEn: row.actualizadoEn.toISOString(),
    });
  }),
);

router.get(
  '/grupos/:grupoId/avances',
  asyncHandler(async (req, res) => {
    const grupoId = String(req.params.grupoId);
    if (!esGrupoValido(grupoId)) throw noEncontrado(`Grupo ${grupoId} no existe`);
    const casoId = req.query.casoId ? String(req.query.casoId).trim() : null;

    const filtros = casoId
      ? and(eq(gruposAvancesTable.grupoId, grupoId), eq(gruposAvancesTable.casoId, casoId))
      : eq(gruposAvancesTable.grupoId, grupoId);

    const filas = await db
      .select({
        casoId: gruposAvancesTable.casoId,
        dispositivoId: gruposAvancesTable.dispositivoId,
        nombre: gruposAvancesTable.nombre,
        contenido: gruposAvancesTable.contenido,
        actualizadoEn: gruposAvancesTable.actualizadoEn,
      })
      .from(gruposAvancesTable)
      .where(filtros)
      .orderBy(desc(gruposAvancesTable.actualizadoEn));

    res.json(
      filas.map((f) => ({
        casoId: f.casoId,
        dispositivoId: f.dispositivoId,
        nombre: f.nombre,
        contenido: f.contenido,
        actualizadoEn: f.actualizadoEn.toISOString(),
      })),
    );
  }),
);

export default router;

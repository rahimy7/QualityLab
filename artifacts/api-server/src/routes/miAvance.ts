/**
 * Avance de la cuenta que hace la petición.
 *
 * Una fila por (usuario, caso). El cliente manda su estado completo, así que
 * la escritura es un reemplazo idempotente y reintentar tras un corte de red
 * no duplica nada.
 */
import { Router, type IRouter } from 'express';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod/v4';
import { db, avancesUsuarioTable } from '@workspace/db';
import { asyncHandler, ErrorHttp } from '../lib/errores';
import { exigirUsuario } from '../lib/auth';

const router: IRouter = Router();

const esquemaGuardado = z.object({
  casoId: z.string().min(1).max(60),
  contenido: z.record(z.string(), z.unknown()),
});

router.get(
  '/mi-avance',
  asyncHandler(async (req, res) => {
    const usuario = await exigirUsuario(req);
    const casoId = String(req.query.casoId ?? '').trim();
    if (!casoId) throw new ErrorHttp(400, 'casoId es obligatorio');

    const [fila] = await db
      .select()
      .from(avancesUsuarioTable)
      .where(and(eq(avancesUsuarioTable.usuarioId, usuario.id), eq(avancesUsuarioTable.casoId, casoId)))
      .limit(1);

    if (!fila) {
      res.status(204).send();
      return;
    }
    res.json({
      casoId: fila.casoId,
      contenido: fila.contenido,
      actualizadoEn: fila.actualizadoEn.toISOString(),
    });
  }),
);

router.put(
  '/mi-avance',
  asyncHandler(async (req, res) => {
    const usuario = await exigirUsuario(req);
    const cuerpo = esquemaGuardado.parse(req.body);

    const [guardado] = await db
      .insert(avancesUsuarioTable)
      .values({ usuarioId: usuario.id, casoId: cuerpo.casoId, contenido: cuerpo.contenido })
      .onConflictDoUpdate({
        target: [avancesUsuarioTable.usuarioId, avancesUsuarioTable.casoId],
        set: { contenido: cuerpo.contenido, actualizadoEn: sql`now()` },
      })
      .returning({ actualizadoEn: avancesUsuarioTable.actualizadoEn });

    res.json({ ok: true, actualizadoEn: guardado.actualizadoEn.toISOString() });
  }),
);

export default router;

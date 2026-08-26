import { Router, type IRouter } from 'express';
import { count, eq, sql } from 'drizzle-orm';
import { db, avancesTable, participantesTable, respuestasTable, type Avance } from '@workspace/db';
import { GuardarAvanceBody, GuardarAvanceParams, ObtenerAvanceParams } from '@workspace/api-zod';
import { asyncHandler, noEncontrado } from '../lib/errores';

const router: IRouter = Router();

function serializar(a: Avance) {
  return {
    participanteId: a.participanteId,
    puntos: a.puntos,
    misiones: a.misiones,
    logros: a.logros,
    respondidas: a.respondidas,
    aciertos: a.aciertos,
    estado: a.estado as Record<string, unknown>,
    actualizadoEn: a.actualizadoEn.toISOString(),
  };
}

async function exigirParticipante(id: string): Promise<void> {
  const [p] = await db
    .select({ id: participantesTable.id })
    .from(participantesTable)
    .where(eq(participantesTable.id, id))
    .limit(1);
  if (!p) throw noEncontrado('El participante no existe o la sesión fue eliminada');
}

router.get(
  '/participantes/:participanteId/avance',
  asyncHandler(async (req, res) => {
    const { participanteId } = ObtenerAvanceParams.parse(req.params);
    await exigirParticipante(participanteId);

    const [avance] = await db
      .select()
      .from(avancesTable)
      .where(eq(avancesTable.participanteId, participanteId))
      .limit(1);

    if (!avance) throw noEncontrado('Este participante todavía no ha guardado avance');
    res.json(serializar(avance));
  }),
);

router.put(
  '/participantes/:participanteId/avance',
  asyncHandler(async (req, res) => {
    const { participanteId } = GuardarAvanceParams.parse(req.params);
    const cuerpo = GuardarAvanceBody.parse(req.body);
    await exigirParticipante(participanteId);

    // El cliente manda siempre su estado completo, así que la escritura es un
    // reemplazo idempotente: reintentar tras un corte de red no duplica nada.
    const guardado = await db.transaction(async (tx) => {
      if (cuerpo.respuestas.length > 0) {
        await tx
          .insert(respuestasTable)
          .values(
            cuerpo.respuestas.map((r) => ({
              participanteId,
              preguntaId: r.preguntaId,
              opcionId: r.opcionId,
              correcta: r.correcta,
            })),
          )
          // La primera respuesta es la que cuenta: el ejercicio se responde una
          // sola vez y la retroalimentación pierde valor si se puede reintentar.
          .onConflictDoNothing({
            target: [respuestasTable.participanteId, respuestasTable.preguntaId],
          });
      }

      // Los contadores se derivan de la tabla, no del cuerpo de la petición: un
      // guardado parcial (o un cliente que envía solo lo nuevo) no debe borrar
      // el historial que ve el facilitador en su tablero.
      const [conteo] = await tx
        .select({
          respondidas: count(),
          aciertos: sql<number>`count(*) filter (where ${respuestasTable.correcta})`.mapWith(Number),
        })
        .from(respuestasTable)
        .where(eq(respuestasTable.participanteId, participanteId));

      const [avance] = await tx
        .insert(avancesTable)
        .values({
          participanteId,
          puntos: cuerpo.puntos,
          misiones: cuerpo.misiones,
          logros: cuerpo.logros,
          respondidas: conteo.respondidas,
          aciertos: conteo.aciertos,
          estado: cuerpo.estado,
        })
        .onConflictDoUpdate({
          target: avancesTable.participanteId,
          set: {
            puntos: cuerpo.puntos,
            misiones: cuerpo.misiones,
            logros: cuerpo.logros,
            respondidas: conteo.respondidas,
            aciertos: conteo.aciertos,
            estado: cuerpo.estado,
            actualizadoEn: new Date(),
          },
        })
        .returning();

      await tx
        .update(participantesTable)
        .set({ vistoEn: new Date() })
        .where(eq(participantesTable.id, participanteId));

      return avance;
    });

    res.json(serializar(guardado));
  }),
);

export default router;

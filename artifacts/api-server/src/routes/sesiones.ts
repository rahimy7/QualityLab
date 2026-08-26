import { Router, type IRouter } from 'express';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import {
  db,
  avancesTable,
  generarCodigoSesion,
  participantesTable,
  respuestasTable,
  sesionesTable,
  type Sesion,
} from '@workspace/db';
import {
  CrearSesionBody,
  ObtenerSesionParams,
  ObtenerTableroParams,
  UnirseSesionBody,
  UnirseSesionParams,
} from '@workspace/api-zod';
import { asyncHandler, noEncontrado } from '../lib/errores';

const router: IRouter = Router();

/** Los códigos se dictan en voz alta: se comparan siempre en mayúsculas. */
function normalizar(codigo: string): string {
  return codigo.trim().toUpperCase();
}

async function buscarSesion(codigo: string): Promise<Sesion> {
  const [sesion] = await db
    .select()
    .from(sesionesTable)
    .where(eq(sesionesTable.codigo, normalizar(codigo)))
    .limit(1);

  if (!sesion) throw noEncontrado(`No existe una sesión con el código ${normalizar(codigo)}`);
  return sesion;
}

function serializarSesion(s: Sesion) {
  return {
    id: s.id,
    codigo: s.codigo,
    nombre: s.nombre,
    facilitador: s.facilitador,
    activa: s.activa,
    creadaEn: s.creadaEn.toISOString(),
  };
}

router.post(
  '/sesiones',
  asyncHandler(async (req, res) => {
    const cuerpo = CrearSesionBody.parse(req.body);

    // El código es corto para poder dictarlo, así que puede chocar. Reintenta
    // con uno nuevo antes de rendirse; a la cuarta, alarga el código.
    for (let intento = 0; intento < 5; intento += 1) {
      const codigo = generarCodigoSesion(intento < 3 ? 6 : 8);
      const existente = await db
        .select({ id: sesionesTable.id })
        .from(sesionesTable)
        .where(eq(sesionesTable.codigo, codigo))
        .limit(1);
      if (existente.length > 0) continue;

      const [sesion] = await db
        .insert(sesionesTable)
        .values({ codigo, nombre: cuerpo.nombre, facilitador: cuerpo.facilitador ?? null })
        .returning();

      res.status(201).json(serializarSesion(sesion));
      return;
    }

    throw new Error('No se pudo generar un código de sesión disponible');
  }),
);

router.get(
  '/sesiones/:codigo',
  asyncHandler(async (req, res) => {
    const { codigo } = ObtenerSesionParams.parse(req.params);
    res.json(serializarSesion(await buscarSesion(codigo)));
  }),
);

router.post(
  '/sesiones/:codigo/participantes',
  asyncHandler(async (req, res) => {
    const { codigo } = UnirseSesionParams.parse(req.params);
    const cuerpo = UnirseSesionBody.parse(req.body);
    const sesion = await buscarSesion(codigo);

    const nombre = cuerpo.nombre.trim();

    // 1) El mismo aparato que ya se unió: se actualizan nombre y equipo.
    let [participante] = await db
      .select()
      .from(participantesTable)
      .where(
        and(
          eq(participantesTable.sesionId, sesion.id),
          eq(participantesTable.dispositivoId, cuerpo.dispositivoId),
        ),
      )
      .limit(1);

    if (participante) {
      [participante] = await db
        .update(participantesTable)
        .set({ nombre, equipoId: cuerpo.equipoId, vistoEn: new Date() })
        .where(eq(participantesTable.id, participante.id))
        .returning();
    } else {
      // 2) Mismo nombre en la sesión desde otro aparato: cambió de teléfono y
      //    recupera su avance. Es el caso que el facilitador advierte al inicio.
      const [porNombre] = await db
        .select()
        .from(participantesTable)
        .where(
          and(
            eq(participantesTable.sesionId, sesion.id),
            sql`lower(${participantesTable.nombre}) = lower(${nombre})`,
          ),
        )
        .limit(1);

      if (porNombre) {
        [participante] = await db
          .update(participantesTable)
          .set({ dispositivoId: cuerpo.dispositivoId, equipoId: cuerpo.equipoId, vistoEn: new Date() })
          .where(eq(participantesTable.id, porNombre.id))
          .returning();
      } else {
        [participante] = await db
          .insert(participantesTable)
          .values({
            sesionId: sesion.id,
            dispositivoId: cuerpo.dispositivoId,
            nombre,
            equipoId: cuerpo.equipoId,
          })
          .returning();
      }
    }

    const [avance] = await db
      .select()
      .from(avancesTable)
      .where(eq(avancesTable.participanteId, participante.id))
      .limit(1);

    res.json({
      sesion: serializarSesion(sesion),
      participante: {
        id: participante.id,
        sesionId: participante.sesionId,
        nombre: participante.nombre,
        equipoId: participante.equipoId,
        creadoEn: participante.creadoEn.toISOString(),
      },
      avance: avance
        ? {
            participanteId: avance.participanteId,
            puntos: avance.puntos,
            misiones: avance.misiones,
            logros: avance.logros,
            respondidas: avance.respondidas,
            aciertos: avance.aciertos,
            estado: avance.estado as Record<string, unknown>,
            actualizadoEn: avance.actualizadoEn.toISOString(),
          }
        : null,
    });
  }),
);

router.get(
  '/sesiones/:codigo/tablero',
  asyncHandler(async (req, res) => {
    const { codigo } = ObtenerTableroParams.parse(req.params);
    const sesion = await buscarSesion(codigo);

    const filas = await db
      .select({
        participanteId: participantesTable.id,
        nombre: participantesTable.nombre,
        equipoId: participantesTable.equipoId,
        vistoEn: participantesTable.vistoEn,
        puntos: avancesTable.puntos,
        misiones: avancesTable.misiones,
        logros: avancesTable.logros,
        respondidas: avancesTable.respondidas,
        aciertos: avancesTable.aciertos,
      })
      .from(participantesTable)
      .leftJoin(avancesTable, eq(avancesTable.participanteId, participantesTable.id))
      .where(eq(participantesTable.sesionId, sesion.id))
      .orderBy(desc(avancesTable.puntos), participantesTable.nombre);

    const ids = filas.map((f) => f.participanteId);

    // Desempeño del aula pregunta por pregunta: qué entendió el grupo, no cómo
    // va cada persona. Con cero participantes, `inArray` con lista vacía genera
    // SQL inválido, así que se evita la consulta.
    const respuestas = ids.length
      ? await db
          .select({
            preguntaId: respuestasTable.preguntaId,
            opcionId: respuestasTable.opcionId,
            correcta: respuestasTable.correcta,
          })
          .from(respuestasTable)
          .where(inArray(respuestasTable.participanteId, ids))
      : [];

    const porPregunta = new Map<
      string,
      { respondidas: number; correctas: number; opciones: Record<string, number> }
    >();

    for (const r of respuestas) {
      const actual = porPregunta.get(r.preguntaId) ?? { respondidas: 0, correctas: 0, opciones: {} };
      actual.respondidas += 1;
      if (r.correcta) actual.correctas += 1;
      actual.opciones[r.opcionId] = (actual.opciones[r.opcionId] ?? 0) + 1;
      porPregunta.set(r.preguntaId, actual);
    }

    const hace5Min = Date.now() - 5 * 60 * 1000;
    const puntos = filas.map((f) => f.puntos ?? 0);

    res.json({
      sesion: serializarSesion(sesion),
      resumen: {
        participantes: filas.length,
        activosUltimos5Min: filas.filter((f) => f.vistoEn.getTime() >= hace5Min).length,
        puntosPromedio: puntos.length ? puntos.reduce((a, b) => a + b, 0) / puntos.length : 0,
        misionesCompletadas: filas.reduce((acc, f) => acc + (f.misiones?.length ?? 0), 0),
      },
      filas: filas.map((f) => ({
        participanteId: f.participanteId,
        nombre: f.nombre,
        equipoId: f.equipoId,
        puntos: f.puntos ?? 0,
        misiones: f.misiones ?? [],
        logros: f.logros ?? [],
        respondidas: f.respondidas ?? 0,
        aciertos: f.aciertos ?? 0,
        vistoEn: f.vistoEn.toISOString(),
      })),
      preguntas: [...porPregunta.entries()]
        .map(([preguntaId, d]) => ({ preguntaId, ...d }))
        .sort((a, b) => a.preguntaId.localeCompare(b.preguntaId)),
    });
  }),
);

export default router;

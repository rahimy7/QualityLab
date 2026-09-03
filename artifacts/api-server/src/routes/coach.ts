/**
 * Quality Coach: el asistente que responde preguntas de método.
 *
 * Antes era solo un buscador de palabras clave sobre un manual fijo, así que
 * cualquier pregunta que no estuviera escrita de antemano recibía un "no lo
 * tengo". Ahora el manual del caso se le pasa al modelo como material de
 * referencia, junto con los indicadores reales y lo que el participante lleva
 * hecho, para que responda del caso que se está trabajando y no en abstracto.
 *
 * Sin estado: el cliente envía el historial en cada llamada. La OPENAI_API_KEY
 * nunca sale del servidor.
 */
import { Router, type IRouter } from 'express';
import { z } from 'zod/v4';
import { chat, ErrorOpenAI, type MensajeChat } from '../lib/openai';
import { logger } from '../lib/logger';
import { exigirUsuario } from '../lib/auth';

const router: IRouter = Router();

const esquemaCuerpo = z.object({
  caso: z.object({
    empresa: z.string().min(1).max(120),
    sector: z.string().min(1).max(160),
    encargo: z.string().min(1).max(1600),
  }),
  /** Indicadores del caso, ya formateados por el cliente. */
  indicadores: z.array(z.string().max(300)).max(15),
  /** Manual del módulo para este caso: es la doctrina que Q debe seguir. */
  manual: z.array(z.object({ titulo: z.string().max(200), respuesta: z.string().max(2000) })).max(30),
  /** Resumen de lo que el participante lleva trabajado en la plataforma. */
  avance: z.array(z.string().max(400)).max(25),
  historial: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(3000) })).max(30),
  pregunta: z.string().min(1).max(1200),
});

/** Mismo criterio que la entrevista: evita que un cliente agote la cuota. */
const MAX_POR_HORA = 40;
const VENTANA_MS = 60 * 60 * 1000;
const conteos = new Map<string, number[]>();

function permitido(clave: string): boolean {
  const ahora = Date.now();
  const hist = (conteos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (hist.length >= MAX_POR_HORA) {
    conteos.set(clave, hist);
    return false;
  }
  hist.push(ahora);
  conteos.set(clave, hist);
  return true;
}

function construirSistema(c: z.infer<typeof esquemaCuerpo>): string {
  return [
    'Eres "Q", el coach de mejora continua de un módulo universitario de gestión de calidad.',
    `El aula trabaja el caso de "${c.caso.empresa}" (${c.caso.sector}).`,
    `Encargo del caso: ${c.caso.encargo}`,
    '',
    'INDICADORES REALES DEL CASO (son los únicos números del caso que puedes citar):',
    ...c.indicadores.map((i) => `- ${i}`),
    '',
    'LO QUE ESTE PARTICIPANTE LLEVA TRABAJADO:',
    ...(c.avance.length ? c.avance.map((a) => `- ${a}`) : ['- Todavía no ha cargado nada.']),
    '',
    'MANUAL DEL MÓDULO (tu doctrina: responde con este criterio, no con el tuyo):',
    ...c.manual.map((m) => `## ${m.titulo}\n${m.respuesta}`),
    '',
    'CÓMO RESPONDES:',
    '- En español, 3-6 frases. Directo, sin rodeos ni saludos de relleno.',
    '- Enseñas criterio, no das la respuesta hecha: el participante debe poder defender su decisión.',
    `- Cuando el tema lo permita, aterriza en el caso de ${c.caso.empresa} con sus indicadores reales.`,
    '- NUNCA inventes cifras. Si un número no está arriba, di que no lo tienes y dónde puede mirarlo en la plataforma.',
    '- Distingue siempre porcentaje de punto porcentual, correlación de causalidad, y síntoma de causa raíz.',
    '- Si la pregunta se sale de la gestión de calidad, dilo en una frase y reconduce al módulo.',
    '- Termina con una sola repregunta que le haga pensar. Sin encabezados ni listas con viñetas.',
  ].join('\n');
}

router.post('/coach/mensaje', async (req, res, next) => {
  try {
    // Exige cuenta: es la llave que impide que un tercero gaste la cuota de IA.
    const usuario = await exigirUsuario(req);

    const parse = esquemaCuerpo.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ mensaje: `cuerpo-invalido: ${parse.error.message}` });
      return;
    }
    const cuerpo = parse.data;

    if (!permitido(usuario.id)) {
      res.status(429).json({
        mensaje: `Superaste el máximo de ${MAX_POR_HORA} preguntas por hora. Espera unos minutos.`,
      });
      return;
    }

    const mensajes: MensajeChat[] = [
      { role: 'system', content: construirSistema(cuerpo) },
      ...cuerpo.historial.map<MensajeChat>((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: cuerpo.pregunta },
    ];

    const respuesta = await chat(mensajes, { temperatura: 0.4, maxTokens: 420 });
    res.json({ respuesta });
  } catch (err) {
    if (err instanceof ErrorOpenAI) {
      logger.warn({ err: err.message, estado: err.estado }, 'Fallo coach IA');
      res.status(err.estado ?? 500).json({ mensaje: `La IA no respondió (${err.message})` });
      return;
    }
    next(err);
  }
});

export default router;

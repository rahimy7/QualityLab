/**
 * Cliente mínimo de OpenAI Chat Completions vía fetch nativa.
 *
 * Se aísla en un módulo propio para poder simularlo desde tests y para no
 * arrastrar el SDK completo a un servicio pequeño.
 */
import { logger } from './logger';

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export interface MensajeChat {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpcionesChat {
  temperatura?: number;
  maxTokens?: number;
}

export class ErrorOpenAI extends Error {
  constructor(mensaje: string, public estado?: number) {
    super(mensaje);
    this.name = 'ErrorOpenAI';
  }
}

/**
 * Llama a Chat Completions y devuelve el texto de la primera opción.
 * Lanza `ErrorOpenAI` si falta la key o la API responde con error.
 */
export async function chat(mensajes: MensajeChat[], opciones: OpcionesChat = {}): Promise<string> {
  const clave = process.env.OPENAI_API_KEY;
  if (!clave) {
    throw new ErrorOpenAI('OPENAI_API_KEY no configurada en el servidor.', 500);
  }
  const modelo = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';

  const respuesta = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${clave}`,
    },
    body: JSON.stringify({
      model: modelo,
      messages: mensajes,
      temperature: opciones.temperatura ?? 0.85,
      max_tokens: opciones.maxTokens ?? 320,
    }),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.text().catch(() => '');
    logger.warn({ estado: respuesta.status, cuerpo }, 'OpenAI devolvió error');
    throw new ErrorOpenAI(`OpenAI ${respuesta.status}`, respuesta.status);
  }

  const datos = (await respuesta.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const texto = datos.choices?.[0]?.message?.content?.trim();
  if (!texto) throw new ErrorOpenAI('Respuesta vacía de OpenAI', 502);
  return texto;
}

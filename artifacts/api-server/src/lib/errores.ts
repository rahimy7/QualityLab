import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod/v4';
import { logger } from './logger';

/** Error de dominio con código HTTP: lo que el cliente sí debe ver. */
export class ErrorHttp extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorHttp';
  }
}

export function noEncontrado(mensaje: string): ErrorHttp {
  return new ErrorHttp(404, mensaje);
}

/** Envuelve un handler async para que sus rechazos lleguen al manejador. */
export function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export function manejadorErrores(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError) {
    const detalle = err.issues
      .map((i) => `${i.path.join('.') || 'cuerpo'}: ${i.message}`)
      .join('; ');
    res.status(400).json({ mensaje: `Solicitud inválida — ${detalle}` });
    return;
  }

  if (err instanceof ErrorHttp) {
    res.status(err.estado).json({ mensaje: err.message });
    return;
  }

  // Un fallo inesperado no debe filtrar detalles internos al aula.
  logger.error({ err }, 'Fallo no controlado');
  res.status(500).json({ mensaje: 'Error interno del servidor' });
}

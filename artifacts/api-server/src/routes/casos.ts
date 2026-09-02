/**
 * Casos del laboratorio. Full DB: el bundle del cliente no lleva contenido
 * embebido, lo hidrata al arrancar desde este endpoint.
 */
import { Router, type IRouter } from 'express';
import { asc, eq } from 'drizzle-orm';
import { db, casosTable } from '@workspace/db';
import { asyncHandler, noEncontrado } from '../lib/errores';

const router: IRouter = Router();

router.get(
  '/casos',
  asyncHandler(async (_req, res) => {
    const casos = await db
      .select({ id: casosTable.id, contenido: casosTable.contenido })
      .from(casosTable)
      .where(eq(casosTable.activo, true))
      .orderBy(asc(casosTable.orden), asc(casosTable.id));
    res.json(casos.map((c) => c.contenido));
  }),
);

router.get(
  '/casos/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const [caso] = await db
      .select({ id: casosTable.id, contenido: casosTable.contenido, activo: casosTable.activo })
      .from(casosTable)
      .where(eq(casosTable.id, id))
      .limit(1);
    if (!caso || !caso.activo) throw noEncontrado(`Caso ${id} no encontrado`);
    res.json(caso.contenido);
  }),
);

export default router;

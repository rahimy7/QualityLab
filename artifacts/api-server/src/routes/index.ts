import { Router, type IRouter } from 'express';
import healthRouter from './health';
import sesionesRouter from './sesiones';
import avanceRouter from './avance';
import entrevistaRouter from './entrevista';
import casosRouter from './casos';
import gruposRouter from './grupos';

const router: IRouter = Router();

router.use(healthRouter);
router.use(sesionesRouter);
router.use(avanceRouter);
router.use(entrevistaRouter);
router.use(casosRouter);
router.use(gruposRouter);

export default router;

import { Router, type IRouter } from 'express';
import healthRouter from './health';
import sesionesRouter from './sesiones';
import avanceRouter from './avance';

const router: IRouter = Router();

router.use(healthRouter);
router.use(sesionesRouter);
router.use(avanceRouter);

export default router;

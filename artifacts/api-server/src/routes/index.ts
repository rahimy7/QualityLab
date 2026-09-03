import { Router, type IRouter } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import miAvanceRouter from './miAvance';
import entrevistaRouter from './entrevista';
import casosRouter from './casos';
import gruposRouter from './grupos';
import coachRouter from './coach';

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(miAvanceRouter);
router.use(entrevistaRouter);
router.use(casosRouter);
router.use(gruposRouter);
router.use(coachRouter);

export default router;

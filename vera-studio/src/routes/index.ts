import { Router } from 'express';
import healthRouter from './health';
import tokensRouter from './tokens';
import buildRouter from './build';

const router = Router();

router.use('/_', healthRouter);
router.use('/tokens', tokensRouter);
router.use('/build', buildRouter);

export default router;

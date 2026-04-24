import { Router } from 'express';
import healthRouter from './health';
import tokensRouter from './tokens';

const router = Router();

router.use('/_', healthRouter);
router.use('/tokens', tokensRouter);

export default router;

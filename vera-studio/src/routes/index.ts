import { Router } from 'express';
import healthRouter from './health';

const router = Router();

router.use('/_', healthRouter);

export default router;

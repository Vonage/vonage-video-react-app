import { Router } from 'express';
import healthRoute from './health';
import sessionRouter from './session';
import feedbackRouter from './feedback';
import wellKnownRouter from './wellKnown';
import loggerRouter from './logger';

const router = Router();

router.use('/_', healthRoute);
router.use('/session', sessionRouter);
router.use('/feedback', feedbackRouter);
router.use('/.well-known', wellKnownRouter);
router.use('/client-logs', loggerRouter);

export default router;

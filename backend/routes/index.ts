import { Router } from 'express';
import healthRoute from './health';
import sessionRouter from './session';
import feedbackRouter from './feedback';
import wellKnownRouter from './wellKnown';
import loggerRouter from './logger';
import videoRouter from './video';
import authRouter from './auth';

const router = Router();

router.use('/_', healthRoute);
router.use('/session', sessionRouter);
router.use('/feedback', feedbackRouter);
router.use('/.well-known', wellKnownRouter);
router.use('/client-logs', loggerRouter);
router.use('/v2', videoRouter);
router.use(authRouter);

export default router;

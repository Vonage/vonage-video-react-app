import { Router } from 'express';
import healthRoute from './health';
import sessionRouter from './session';
import feedbackRouter from './feedback';
import wellKnownRouter from './wellKnown';

const router = Router();

router.use('/_', healthRoute);
router.use('/session', sessionRouter);
router.use('/feedback', feedbackRouter);
router.use('/.well-known', wellKnownRouter);

export default router;

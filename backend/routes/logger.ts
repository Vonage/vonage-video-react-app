import express, { Request, Response, Router } from 'express';
import { forwardToGollum } from '../services/gollumClientService';
import { ClientLogEventSchema } from '../types/ClientLogEventSchema';

const loggerRouter = Router();

/** JSON body parser with 50kb limit (logger route only; avoids large payloads). */
loggerRouter.use(express.json({ limit: '50kb' }));

/**
 * Backend logging endpoint. Validates the payload and forwards to Gollum/HLG when configured.
 */
loggerRouter.post('/', (req: Request, res: Response) => {
  const parsed = ClientLogEventSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid log payload',
    });
  }

  const event = parsed.data;
  void forwardToGollum(event).catch(console.error);

  return res.sendStatus(200);
});

export default loggerRouter;

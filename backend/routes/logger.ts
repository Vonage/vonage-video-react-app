import express, { Request, Response, Router } from 'express';
import { StatusCode } from 'status-code-enum';
import attempt from '@common/execution/attempt';
import { forward } from '../services/loggerService';
import { ClientLogEventSchema } from '@common/types';
import { makeBadRequestErrorHandler } from '@api-lib/errors';

const loggerRouter = Router();

/**
 * Backend logging endpoint. Validates the payload and forwards to Kibana when configured.
 * For EnterMeeting events, also sends the OTKAnalytics-formatted log.
 * Fails fast on data violation. Returns 204 No Content on success.
 *
 * 50kb limit only
 */
loggerRouter.post('/', express.json({ limit: '50kb' }), (req: Request, res: Response) => {
  const parsed = ClientLogEventSchema.safeParse(req.body);

  if (!parsed.success) {
    const validationError = makeBadRequestErrorHandler('Invalid log payload')(parsed.error);

    return res.status(StatusCode.ClientErrorBadRequest).json(validationError.exportSafely());
  }

  const event = parsed.data;
  attempt(() => forward(event), console.error);

  return res.sendStatus(204);
});

/**
 * Batch logging endpoint. Accepts a JSON array of log events and processes each one.
 * Fails fast on the first data violation. Returns 204 No Content on success.
 *
 * 50mb limit only
 */
loggerRouter.post('/batch', express.json({ limit: '50mb' }), (req: Request, res: Response) => {
  const parsed = ClientLogEventSchema.array().safeParse(req.body);

  if (!parsed.success) {
    const validationError = makeBadRequestErrorHandler('Invalid log batch payload')(parsed.error);

    return res.status(StatusCode.ClientErrorBadRequest).json(validationError.exportSafely());
  }

  for (const event of parsed.data) {
    attempt(() => forward(event), console.error);
  }

  return res.sendStatus(204);
});

export default loggerRouter;

import express, { Request, Response, Router } from 'express';
import { StatusCode } from 'status-code-enum';
import attempt from '@common/execution/attempt';
import { forward } from '../services/loggerService';
import { ClientLogEventSchema } from '@common/types';
import { makeBadRequestErrorHandler } from '@api-lib/errors';

const loggerRouter = Router();

/** JSON body parser with 50kb limit (logger route only; avoids large payloads). */
loggerRouter.use(express.json({ limit: '50kb' }));

/**
 * Backend logging endpoint. Validates the payload and forwards to Kibana when configured.
 * For EnterMeeting events, also sends the OTKAnalytics-formatted log.
 * Fails fast on data violation. Returns 204 No Content on success.
 */
loggerRouter.post('/', (req: Request, res: Response) => {
  const parsed = ClientLogEventSchema.safeParse(req.body);

  if (!parsed.success) {
    const validationError = makeBadRequestErrorHandler('Invalid log payload')(parsed.error);

    return res.status(StatusCode.ClientErrorBadRequest).json(validationError.exportSafely());
  }

  const event = parsed.data;
  attempt(() => forward(event), console.error);

  return res.sendStatus(204);
});

export default loggerRouter;

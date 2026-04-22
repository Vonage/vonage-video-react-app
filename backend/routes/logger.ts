import express, { Request, Response, Router } from 'express';
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
loggerRouter.post('/', express.json({ limit: '50kb' }), async (req: Request, res: Response) => {
  try {
    const parsed = ClientLogEventSchema.safeParse(req.body);

    if (!parsed.success) {
      throw makeBadRequestErrorHandler('Invalid log payload')(parsed.error);
    }

    const event = parsed.data;
    await forward(event);

    return res.sendStatus(204);
  } catch (error) {
    const applicationError = makeBadRequestErrorHandler('Unexpected error in log forwarding')(
      error
    );

    return res.status(applicationError.statusCode).json(applicationError.exportSafely());
  }
});

/**
 * Batch logging endpoint. Accepts a JSON array of log events and processes each one.
 * Fails fast on the first data violation. Returns 204 No Content on success.
 *
 * 50mb limit only
 */
loggerRouter.post(
  '/batch',
  express.json({ limit: '50mb' }),
  async (req: Request, res: Response) => {
    try {
      const parsed = ClientLogEventSchema.array().safeParse(req.body);

      if (!parsed.success) {
        throw makeBadRequestErrorHandler('Invalid log batch payload')(parsed.error);
      }

      for (const event of parsed.data) {
        await forward(event);
      }

      return res.sendStatus(204);
    } catch (error) {
      const applicationError = makeBadRequestErrorHandler('Unexpected error in log forwarding')(
        error
      );

      return res.status(applicationError.statusCode).json(applicationError.exportSafely());
    }
  }
);

export default loggerRouter;

import express, { Request, Response, Router } from 'express';
import { ZodError } from 'zod';
import attempt from '@common/execution/attempt';
import tryCatch from '@common/execution/tryCatch';
import { validationErrorHandler } from '../middleware/validationErrorHandler';
import { ValidationError } from '../errors/ValidationError';
import { forwardToGollum } from '../services/gollumClientService';
import type { ClientLogEvent } from '@common/logger';
import { ClientLogEventSchema } from '../types/ClientLogEvent';

const loggerRouter = Router();

/** JSON body parser with 50kb limit (logger route only; avoids large payloads). */
loggerRouter.use(express.json({ limit: '50kb' }));

function formatValidationIssues(error: ZodError): { path: (string | number)[]; message: string }[] {
  return error.issues.map((issue) => ({
    path: issue.path as (string | number)[],
    message: issue.message,
  }));
}

/**
 * Backend logging endpoint. Validates the payload and forwards to Gollum/HLG when configured.
 * Fails fast on data violation. Returns 204 No Content on success (standard for logs).
 */
loggerRouter.post('/', (req: Request, res: Response, next: express.NextFunction) => {
  const { result: event, error } = tryCatch(() => ClientLogEventSchema.parse(req.body));

  if (error) {
    if (error instanceof ZodError) {
      return next(new ValidationError(formatValidationIssues(error)));
    }
    next(error);
    return;
  }

  if (!event) {
    next(new Error('Unexpected: parse succeeded but result is null'));
    return;
  }
  void attempt(() => forwardToGollum(event as ClientLogEvent), console.error);
  return res.sendStatus(204);
});

loggerRouter.use(validationErrorHandler);

export default loggerRouter;

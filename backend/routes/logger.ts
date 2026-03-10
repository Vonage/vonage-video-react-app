import express, { Request, Response, Router } from 'express';
import { ZodError } from 'zod';
import attempt from '@common/execution/attempt';
import { forward } from '../services/loggerService';
import { ClientLogEventSchema } from '@common/types';

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
 * Backend logging endpoint. Validates the payload and forwards to Kibana when configured.
 * For EnterMeeting events, also sends the OTKAnalytics-formatted log.
 * Fails fast on data violation. Returns 204 No Content on success.
 */
loggerRouter.post('/', (req: Request, res: Response) => {
  const parsed = ClientLogEventSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid request',
      severity: 'error',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      issues: formatValidationIssues(parsed.error as ZodError),
    });
  }

  const event = parsed.data;
  attempt(() => forward(event), console.error);

  return res.sendStatus(204);
});

export default loggerRouter;

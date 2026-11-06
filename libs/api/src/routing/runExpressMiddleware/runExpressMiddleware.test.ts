import { describe, expect, it } from 'vitest';
import express, { type Request, type RequestHandler, type Response } from 'express';
import request from 'supertest';
import { StatusCode } from 'status-code-enum';
import { ApplicationServerError } from '@api-lib/errors';
import createVideoHandler from '../videoHandler/createVideoHandler';
import runExpressMiddleware from './runExpressMiddleware';

type TestContext = { req: Request; res: Response };

function buildApp(middleware: RequestHandler) {
  const videoHandler = createVideoHandler<TestContext>({
    auth: { authType: 'apiKey', apiKey: 'test-api-key', apiSecret: 'test-api-secret' },
    createContext: ({ req, res }) => ({ req, res }),
  });

  videoHandler.override$('createSessionAndJoin', () => ({ sessionId: 'session-1' }) as never);
  videoHandler.use$('createSessionAndJoin', async function runTestMiddleware({ ctx, next }) {
    await runExpressMiddleware({ middleware, req: ctx.req, res: ctx.res });

    return next();
  });

  const app = express();
  app.use(express.json());
  app.use('/v2', videoHandler);

  return app;
}

describe('runExpressMiddleware', () => {
  it('runs the action when the middleware calls next', async () => {
    const response = await request(buildApp((_req, _res, next) => next()))
      .post('/v2/createSessionAndJoin')
      .send({});

    expect(response.statusCode).toEqual(200);
  });

  it('answers with the status of the error the middleware passes to next', async () => {
    const rejectingMiddleware: RequestHandler = (_req, _res, next) =>
      next(
        new ApplicationServerError({
          src: null,
          fallbackConfig: {
            fallbackMessage: 'Too many requests',
            statusCode: StatusCode.ClientErrorTooManyRequests,
          },
        })
      );

    const response = await request(buildApp(rejectingMiddleware))
      .post('/v2/createSessionAndJoin')
      .send({});

    expect(response.statusCode).toEqual(429);
    expect(response.body.error.message).toEqual('Too many requests');
  });
});

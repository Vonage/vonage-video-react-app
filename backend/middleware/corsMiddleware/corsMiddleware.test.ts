import express from 'express';
import request from 'supertest';
import { afterAll, expect, it } from 'vitest';
import corsMiddleware from './corsMiddleware';

const originalAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS;

afterAll(() => {
  if (originalAllowedOrigins === undefined) {
    delete process.env.CORS_ALLOWED_ORIGINS;
    return;
  }

  process.env.CORS_ALLOWED_ORIGINS = originalAllowedOrigins;
});

it('echoes an allowlisted origin with credentials and does not echo any other origin', async () => {
  expect.assertions(4);

  process.env.CORS_ALLOWED_ORIGINS = 'https://allowed.example';

  const app = express();

  app.use(corsMiddleware());
  app.get('/_/health', (_req, res) => {
    res.sendStatus(200);
  });

  const allowedResponse = await request(app)
    .get('/_/health')
    .set('Origin', 'https://allowed.example');
  const disallowedResponse = await request(app)
    .get('/_/health')
    .set('Origin', 'https://evil.example');
  const responseWithoutOrigin = await request(app).get('/_/health');

  expect(allowedResponse.headers['access-control-allow-origin']).toBe('https://allowed.example');
  expect(allowedResponse.headers['access-control-allow-credentials']).toBe('true');
  expect(disallowedResponse.headers['access-control-allow-origin']).toBeUndefined();
  expect(responseWithoutOrigin.statusCode).toBe(200);
});

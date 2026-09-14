import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import { errorHandler } from '../errorHandler';
import authMiddleware from './authMiddleware';

jest.mock('axios');

const mockPost = jest.spyOn(axios, 'post');

const CLIENT_ID = 'test-client-id';

function buildApp(): Express {
  const app = express();

  app.use(authMiddleware());
  app.get('/protected', (_req, res) => res.status(200).json({ ok: true }));
  app.use(errorHandler);

  return app;
}

describe('authMiddleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      AUTH_ENABLED: 'true',
      OIDC_ISSUER_URL: 'https://example.com',
      OIDC_CLIENT_ID: CLIENT_ID,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    mockPost.mockReset();
  });

  it('is a no-op when auth is disabled', async () => {
    expect.assertions(2);

    process.env.AUTH_ENABLED = 'false';

    const res = await request(buildApp()).get('/protected');

    expect(res.statusCode).toEqual(200);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('throws at construction when auth is enabled but a required field is missing', () => {
    delete process.env.OIDC_ISSUER_URL;
    delete process.env.OIDC_CLIENT_ID;

    expect(() => authMiddleware()).toThrow();
  });

  it('returns 401 when the token is missing', async () => {
    expect.assertions(1);

    const res = await request(buildApp()).get('/protected');

    expect(res.statusCode).toEqual(401);
  });

  it('returns 200 with a valid Bearer token issued to this client', async () => {
    expect.assertions(1);

    mockPost.mockResolvedValue({
      data: { active: true, sub: 'user-1', client_id: CLIENT_ID },
    });

    const res = await request(buildApp())
      .get('/protected')
      .set('Authorization', 'Bearer valid-token');

    expect(res.statusCode).toEqual(200);
  });

  it.each([
    ['token inactive', { active: false }],
    ['issued to a different client_id', { active: true, sub: 'user-2', client_id: 'other-app' }],
    ['response fails schema validation', { unexpected: 'shape' }],
  ])('returns 401 when %s', async (_label, data) => {
    expect.assertions(1);

    mockPost.mockResolvedValue({ data });

    const res = await request(buildApp())
      .get('/protected')
      .set('Authorization', 'Bearer some-token');

    expect(res.statusCode).toEqual(401);
  });

  it('returns 401 when the introspection call itself fails', async () => {
    expect.assertions(1);

    mockPost.mockRejectedValue(new Error('network error'));

    const res = await request(buildApp())
      .get('/protected')
      .set('Authorization', 'Bearer some-token');

    expect(res.statusCode).toEqual(401);
  });

  it('skips a request path in excludedPaths without introspecting', async () => {
    expect.assertions(2);

    const app = express();

    app.use(authMiddleware({ excludedPaths: ['/protected'] }));
    app.get('/protected', (_req, res) => res.status(200).json({ ok: true }));
    app.use(errorHandler);

    const res = await request(app).get('/protected');

    expect(res.statusCode).toEqual(200);
    expect(mockPost).not.toHaveBeenCalled();
  });
});

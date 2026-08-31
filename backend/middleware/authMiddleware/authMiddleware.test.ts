import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import type { Config } from '../../types/config';

const loadConfigMock = jest.fn<() => Config>();
const axiosPostMock = jest.fn<() => Promise<{ data: unknown }>>();

jest.unstable_mockModule('../../helpers/config', () => ({
  default: loadConfigMock,
}));

jest.unstable_mockModule('axios', () => ({
  default: { post: axiosPostMock },
}));

const { default: authMiddleware } = await import('./authMiddleware');
const { errorHandler } = await import('../errorHandler');

const CONFIGURED_CLIENT_ID = 'test-client-id';

const BASE_CONFIG = {
  provider: 'opentok',
  apiKey: 'test-api-key',
  apiSecret: 'test-api-secret',
  sessionKeySecret: 'test-session-key-secret',
  loggerVerbose: false,
} as const;

const DISABLED_CONFIG: Config = { ...BASE_CONFIG, authEnabled: false };

const ENABLED_CONFIG: Config = {
  ...BASE_CONFIG,
  authEnabled: true,
  oidcIssuerUrl: 'https://example.com',
  oidcClientId: CONFIGURED_CLIENT_ID,
  authHeaderName: 'authorization',
  authScheme: 'Bearer',
  introspectPath: '/oauth2/v1/introspect',
  introspectionTimeoutMs: 5000,
};

function buildApp(): Express {
  const app = express();

  app.use(authMiddleware());
  app.get('/protected', (_req, res) => res.status(200).json({ ok: true }));
  app.use(errorHandler);

  return app;
}

describe('authMiddleware', () => {
  beforeEach(() => {
    loadConfigMock.mockReturnValue(ENABLED_CONFIG);
  });

  it('is a no-op when AUTH_ENABLED is false', async () => {
    loadConfigMock.mockReturnValue(DISABLED_CONFIG);

    const res = await request(buildApp()).get('/protected');

    expect(res.statusCode).toEqual(200);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is missing', async () => {
    const res = await request(buildApp()).get('/protected');

    expect(res.statusCode).toEqual(401);
  });

  it('returns 200 with a valid Bearer token', async () => {
    axiosPostMock.mockResolvedValue({
      data: { active: true, sub: 'user-1', client_id: CONFIGURED_CLIENT_ID },
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
    axiosPostMock.mockResolvedValue({ data });

    const res = await request(buildApp())
      .get('/protected')
      .set('Authorization', 'Bearer some-token');

    expect(res.statusCode).toEqual(401);
  });

  it('returns 401 when the introspection call itself fails', async () => {
    axiosPostMock.mockRejectedValue(new Error('network error'));

    const res = await request(buildApp())
      .get('/protected')
      .set('Authorization', 'Bearer some-token');

    expect(res.statusCode).toEqual(401);
  });

  it('skips a request path in excludedPaths entirely', async () => {
    const app = express();

    app.use(authMiddleware({ excludedPaths: ['/protected'] }));
    app.get('/protected', (_req, res) => res.status(200).json({ ok: true }));
    app.use(errorHandler);

    const res = await request(app).get('/protected');

    expect(res.statusCode).toEqual(200);
  });
});

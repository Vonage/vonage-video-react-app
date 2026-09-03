import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import type { Config } from '../../types/config';
import { SESSION_COOKIE_NAME } from '../../routes/auth/constants';
import getSessionStorageService from '../../sessionStorageService';

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
const CONFIGURED_WEB_CLIENT_ID = 'test-web-client-id';

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
  oidcWebClientId: CONFIGURED_WEB_CLIENT_ID,
  oidcWebRedirectUri: 'http://localhost:3000/api/auth/callback/okta',
  authHeaderName: 'authorization',
  authScheme: 'Bearer',
  introspectPath: '/oauth2/v1/introspect',
  authorizePath: '/oauth2/v1/authorize',
  tokenPath: '/oauth2/v1/token',
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

  it('returns 200 for a token issued to the Web client_id', async () => {
    axiosPostMock.mockResolvedValue({
      data: { active: true, sub: 'user-1', client_id: CONFIGURED_WEB_CLIENT_ID },
    });

    const res = await request(buildApp())
      .get('/protected')
      .set('Authorization', 'Bearer valid-web-token');

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

  it('falls back to the session cookie when there is no Bearer header, resolving it via SessionStorage', async () => {
    axiosPostMock.mockResolvedValue({
      data: { active: true, sub: 'user-1', client_id: CONFIGURED_CLIENT_ID },
    });

    const sessionService = getSessionStorageService();
    await sessionService.setAccessToken({ sessionId: 'session-abc', accessToken: 'session-token' });

    const res = await request(buildApp())
      .get('/protected')
      .set('Cookie', `${SESSION_COOKIE_NAME}=session-abc`);

    expect(res.statusCode).toEqual(200);
    const [, body] = axiosPostMock.mock.calls[0] as unknown as [string, URLSearchParams];
    expect(body.toString()).toContain('token=session-token');
  });

  it('returns 401 when the session cookie does not resolve to a stored access token', async () => {
    const res = await request(buildApp())
      .get('/protected')
      .set('Cookie', `${SESSION_COOKIE_NAME}=unknown-session-id`);

    expect(res.statusCode).toEqual(401);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });
});

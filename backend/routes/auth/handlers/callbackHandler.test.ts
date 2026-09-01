import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import type { Config } from '../../../types/config';
import { SESSION_COOKIE_NAME, TRANSACTION_COOKIE_NAME } from '../constants';

const loadConfigMock = jest.fn<() => Config>();
const axiosPostMock = jest.fn<() => Promise<{ data: unknown }>>();

jest.unstable_mockModule('../../../helpers/config', () => ({
  default: loadConfigMock,
}));

jest.unstable_mockModule('axios', () => ({
  // `defaults` is needed because importing `./callbackHandler` transitively pulls in
  // `getSessionStorageService` → `@vonage/vcr-sdk`, whose module-level `Bridge` construction
  // sets `axios.defaults.httpAgent` — it would crash against a bare `{ post }` mock.
  default: { post: axiosPostMock, defaults: {} },
}));

const { default: makeCallbackHandler } = await import('./callbackHandler');
const { errorHandler } = await import('../../../middleware/errorHandler');
const { default: getSessionStorageService } = await import('../../../sessionStorageService');

const ENABLED_CONFIG: Config = {
  provider: 'opentok',
  apiKey: 'test-api-key',
  apiSecret: 'test-api-secret',
  sessionKeySecret: 'test-session-key-secret',
  loggerVerbose: false,
  authEnabled: true,
  oidcIssuerUrl: 'https://example.okta.com',
  oidcClientId: 'test-mobile-client-id',
  oidcWebClientId: 'test-web-client-id',
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

  app.get('/api/auth/callback/okta', makeCallbackHandler());
  app.use(errorHandler);

  return app;
}

async function seedTransaction({
  transactionId,
  state,
  codeVerifier = 'test-code-verifier',
}: {
  transactionId: string;
  state: string;
  codeVerifier?: string;
}): Promise<void> {
  const sessionService = getSessionStorageService();
  await sessionService.setAuthTransaction({ transactionId, state, codeVerifier });
}

describe('callbackHandler', () => {
  beforeEach(() => {
    loadConfigMock.mockReturnValue(ENABLED_CONFIG);
  });

  it('exchanges the code for a token, stores the session, and redirects on the happy path', async () => {
    await seedTransaction({ transactionId: 'txn-1', state: 'state-1' });
    axiosPostMock.mockResolvedValue({
      data: { access_token: 'okta-access-token', token_type: 'Bearer', expires_in: 3600 },
    });

    const res = await request(buildApp())
      .get('/api/auth/callback/okta?code=auth-code&state=state-1')
      .set('Cookie', `${TRANSACTION_COOKIE_NAME}=txn-1`);

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/');

    const setCookieHeaders = res.headers['set-cookie'] as unknown as string[];
    const sessionCookie = setCookieHeaders.find((cookie) =>
      cookie.startsWith(`${SESSION_COOKIE_NAME}=`)
    );
    expect(sessionCookie).toContain('HttpOnly');

    const [tokenUrl, body] = axiosPostMock.mock.calls[0] as unknown as [string, URLSearchParams];
    expect(tokenUrl).toEqual('https://example.okta.com/oauth2/v1/token');
    expect(body.toString()).toContain('code_verifier=test-code-verifier');

    const sessionService = getSessionStorageService();
    const sessionId = sessionCookie!.split(';')[0].split('=')[1];
    expect(await sessionService.getAccessToken({ sessionId })).toEqual('okta-access-token');
    expect(await sessionService.getAuthTransaction({ transactionId: 'txn-1' })).toBeNull();
  });

  it('returns 401 when the state parameter does not match the stored transaction', async () => {
    await seedTransaction({ transactionId: 'txn-2', state: 'expected-state' });

    const res = await request(buildApp())
      .get('/api/auth/callback/okta?code=auth-code&state=wrong-state')
      .set('Cookie', `${TRANSACTION_COOKIE_NAME}=txn-2`);

    expect(res.statusCode).toEqual(401);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('returns 401 when there is no transaction cookie', async () => {
    const res = await request(buildApp()).get('/api/auth/callback/okta?code=auth-code&state=any');

    expect(res.statusCode).toEqual(401);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the transaction cookie does not resolve to a stored transaction', async () => {
    const res = await request(buildApp())
      .get('/api/auth/callback/okta?code=auth-code&state=any')
      .set('Cookie', `${TRANSACTION_COOKIE_NAME}=unknown-transaction`);

    expect(res.statusCode).toEqual(401);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('returns 401 when Okta reports an error on the callback', async () => {
    const res = await request(buildApp()).get(
      '/api/auth/callback/okta?error=access_denied&error_description=user+cancelled'
    );

    expect(res.statusCode).toEqual(401);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('returns a bad-gateway-style error when the token exchange call fails', async () => {
    await seedTransaction({ transactionId: 'txn-3', state: 'state-3' });
    axiosPostMock.mockRejectedValue(new Error('network error'));

    const res = await request(buildApp())
      .get('/api/auth/callback/okta?code=auth-code&state=state-3')
      .set('Cookie', `${TRANSACTION_COOKIE_NAME}=txn-3`);

    expect(res.statusCode).toEqual(502);
  });
});

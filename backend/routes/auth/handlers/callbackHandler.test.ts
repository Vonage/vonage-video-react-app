import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import type { Config } from '../../../types/config';
import SessionCookieSchema from '../schemas/SessionCookie.schema';
import { TEST_AUTH_COOKIE_SECRET } from '../../../tests/helpers/testAuthCookieSecret';
import makeEncryptedCookieHeader from '../../../tests/helpers/makeEncryptedCookieHeader';
import readSetCookie from '../../../tests/helpers/readSetCookie';
import readEncryptedSetCookie from '../../../tests/helpers/readEncryptedSetCookie';

const SESSION_COOKIE_NAME = 'test_session';
const ID_TOKEN_COOKIE_NAME = 'test_id_token';
const TRANSACTION_COOKIE_NAME = 'test_transaction';

const loadConfigMock = jest.fn<() => Config>();
const axiosPostMock = jest.fn<() => Promise<{ data: unknown }>>();

jest.unstable_mockModule('../../../helpers/config', () => ({
  default: loadConfigMock,
}));

jest.unstable_mockModule('axios', () => ({
  default: { post: axiosPostMock, defaults: {} },
}));

const { default: makeCallbackHandler } = await import('./callbackHandler');
const { errorHandler } = await import('../../../middleware/errorHandler');

const ENABLED_CONFIG: Config = {
  provider: 'opentok',
  apiKey: 'test-api-key',
  apiSecret: 'test-api-secret',
  sessionKeySecret: 'test-session-key-secret',
  loggerVerbose: false,
  corsAllowedOrigins: ['*'],
  authEnabled: true,
  oidcClientId: 'test-client-id',
  oidcWebRedirectUri: 'http://localhost:3000/api/auth/callback/okta',
  oidcAuthorizationEndpoint: 'https://example.okta.com/oauth2/v1/authorize',
  oidcTokenEndpoint: 'https://example.okta.com/oauth2/v1/token',
  oidcIntrospectionEndpoint: 'https://example.okta.com/oauth2/v1/introspect',
  oidcRevocationEndpoint: 'https://example.okta.com/oauth2/v1/revoke',
  oidcEndSessionEndpoint: 'https://example.okta.com/oauth2/v1/logout',
  oidcPostLogoutRedirectUri: 'http://localhost:3000/',
  oidcScopes: 'openid profile email offline_access',
  authCookieSecret: TEST_AUTH_COOKIE_SECRET,
  authHeaderName: 'authorization',
  authScheme: 'Bearer',
  authSessionCookieName: SESSION_COOKIE_NAME,
  authIdTokenCookieName: ID_TOKEN_COOKIE_NAME,
  authTransactionCookieName: TRANSACTION_COOKIE_NAME,
  authTransactionMaxAgeSeconds: 600,
  authRefreshWindowSeconds: 30,
  authProviderTimeoutMs: 5000,
};

const CALLBACK_PATH = '/api/auth/callback/okta';

function buildApp(): Express {
  const app = express();

  app.get(CALLBACK_PATH, makeCallbackHandler());
  app.use(errorHandler);

  return app;
}

function transactionCookie({ state, returnTo = '/' }: { state: string; returnTo?: string }) {
  return makeEncryptedCookieHeader({
    name: TRANSACTION_COOKIE_NAME,
    payload: { state, codeVerifier: 'test-code-verifier', returnTo },
  });
}

function completeCallback({
  tokenResponse,
  returnTo,
}: {
  tokenResponse: Record<string, unknown>;
  returnTo?: string;
}) {
  axiosPostMock.mockResolvedValue({ data: tokenResponse });

  return request(buildApp())
    .get(`${CALLBACK_PATH}?code=auth-code&state=state-1`)
    .set('Cookie', transactionCookie({ state: 'state-1', returnTo }));
}

const BASE_TOKEN_RESPONSE = { access_token: 'access-1', token_type: 'Bearer', expires_in: 3600 };

describe('callbackHandler', () => {
  beforeEach(() => {
    loadConfigMock.mockReturnValue(ENABLED_CONFIG);
  });

  it('exchanges the code with the PKCE verifier, writes the encrypted session and redirects to returnTo', async () => {
    const res = await completeCallback({
      tokenResponse: { ...BASE_TOKEN_RESPONSE, refresh_token: 'refresh-1', id_token: 'id-1' },
      returnTo: '/room/abc123',
    });

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/room/abc123');

    const [tokenUrl, body] = axiosPostMock.mock.calls[0] as unknown as [string, URLSearchParams];
    expect(tokenUrl).toEqual('https://example.okta.com/oauth2/v1/token');
    expect(body.toString()).toContain('code_verifier=test-code-verifier');

    const session = readEncryptedSetCookie({
      headers: res.headers,
      name: SESSION_COOKIE_NAME,
      schema: SessionCookieSchema,
    });
    expect(session).toEqual(
      expect.objectContaining({ accessToken: 'access-1', refreshToken: 'refresh-1' })
    );
    expect(readSetCookie({ headers: res.headers, name: ID_TOKEN_COOKIE_NAME })).toContain(
      'Path=/auth/signout'
    );
    expect(readSetCookie({ headers: res.headers, name: TRANSACTION_COOKIE_NAME })).toMatch(
      /Expires=Thu, 01 Jan 1970/
    );
  });

  it.each([
    ['there is no refresh token', BASE_TOKEN_RESPONSE, /Max-Age=3600/],
    [
      'the provider reports the refresh token lifetime',
      { ...BASE_TOKEN_RESPONSE, refresh_token: 'refresh-1', refresh_expires_in: 86400 },
      /Max-Age=86400/,
    ],
  ])('bounds the session cookie lifetime when %s', async (_label, tokenResponse, expected) => {
    const res = await completeCallback({ tokenResponse });

    expect(readSetCookie({ headers: res.headers, name: SESSION_COOKIE_NAME })).toMatch(expected);
  });

  it('writes a browser-session cookie when the refresh token lifetime is not reported', async () => {
    const res = await completeCallback({
      tokenResponse: { ...BASE_TOKEN_RESPONSE, refresh_token: 'refresh-1' },
    });

    const sessionCookie = readSetCookie({ headers: res.headers, name: SESSION_COOKIE_NAME });
    expect(sessionCookie).not.toMatch(/Max-Age|Expires/);
  });

  it('returns 401 when the state parameter does not match the transaction', async () => {
    const res = await request(buildApp())
      .get(`${CALLBACK_PATH}?code=auth-code&state=wrong-state`)
      .set('Cookie', transactionCookie({ state: 'expected-state' }));

    expect(res.statusCode).toEqual(401);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it.each([
    ['there is no transaction cookie', undefined],
    ['the transaction cookie is tampered', `${TRANSACTION_COOKIE_NAME}=v1.tampered.value.tag`],
  ])('returns 401 when %s', async (_label, cookie) => {
    const callbackRequest = request(buildApp()).get(`${CALLBACK_PATH}?code=auth-code&state=any`);

    const res = await (cookie ? callbackRequest.set('Cookie', cookie) : callbackRequest);

    expect(res.statusCode).toEqual(401);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the provider reports an error on the callback', async () => {
    const res = await request(buildApp()).get(
      `${CALLBACK_PATH}?error=access_denied&error_description=user+cancelled`
    );

    expect(res.statusCode).toEqual(401);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('returns a bad-gateway error when the token exchange call fails', async () => {
    axiosPostMock.mockRejectedValue(new Error('network error'));

    const res = await request(buildApp())
      .get(`${CALLBACK_PATH}?code=auth-code&state=state-1`)
      .set('Cookie', transactionCookie({ state: 'state-1' }));

    expect(res.statusCode).toEqual(502);
  });
});

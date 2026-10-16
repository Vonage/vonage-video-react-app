import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import type { Config } from '../../../types/config';
import AuthTransactionCookieSchema from '../schemas/AuthTransactionCookie.schema';
import { TEST_AUTH_COOKIE_SECRET } from '../../../tests/helpers/testAuthCookieSecret';
import readSetCookie from '../../../tests/helpers/readSetCookie';
import readEncryptedSetCookie from '../../../tests/helpers/readEncryptedSetCookie';

const SESSION_COOKIE_NAME = 'test_session';
const ID_TOKEN_COOKIE_NAME = 'test_id_token';
const TRANSACTION_COOKIE_NAME = 'test_transaction';

const loadConfigMock = jest.fn<() => Config>();

jest.unstable_mockModule('../../../helpers/config', () => ({
  default: loadConfigMock,
}));

const { default: makeSignInHandler } = await import('./signInHandler');
const { errorHandler } = await import('../../../middleware/errorHandler');

const DISABLED_CONFIG: Config = {
  provider: 'opentok',
  apiKey: 'test-api-key',
  apiSecret: 'test-api-secret',
  sessionKeySecret: 'test-session-key-secret',
  loggerVerbose: false,
  corsAllowedOrigins: ['*'],
  authEnabled: false,
};

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

function buildApp(): Express {
  const app = express();

  app.get('/auth/signin', makeSignInHandler());
  app.use(errorHandler);

  return app;
}

describe('signInHandler', () => {
  beforeEach(() => {
    loadConfigMock.mockReturnValue(ENABLED_CONFIG);
  });

  it('returns 404 when OIDC auth is not enabled', async () => {
    loadConfigMock.mockReturnValue(DISABLED_CONFIG);

    const res = await request(buildApp()).get('/auth/signin');

    expect(res.statusCode).toEqual(404);
  });

  it('redirects to the authorize endpoint with the correct query params and sets a transaction cookie', async () => {
    const res = await request(buildApp()).get('/auth/signin');

    expect(res.statusCode).toEqual(302);

    const location = new URL(res.headers.location);
    expect(location.origin + location.pathname).toEqual(
      'https://example.okta.com/oauth2/v1/authorize'
    );
    expect(location.searchParams.get('response_type')).toEqual('code');
    expect(location.searchParams.get('client_id')).toEqual('test-client-id');
    expect(location.searchParams.get('redirect_uri')).toEqual(
      'http://localhost:3000/api/auth/callback/okta'
    );
    expect(location.searchParams.get('scope')).toEqual('openid profile email offline_access');
    expect(location.searchParams.get('code_challenge_method')).toEqual('S256');
    expect(location.searchParams.get('state')).toBeTruthy();
    expect(location.searchParams.get('code_challenge')).toBeTruthy();

    const setCookieHeader = res.headers['set-cookie'][0];
    expect(setCookieHeader).toContain(`${TRANSACTION_COOKIE_NAME}=`);
    expect(setCookieHeader).toContain('HttpOnly');
  });

  it('stores state, PKCE verifier and a safe returnTo in an encrypted cookie scoped to the callback', async () => {
    const res = await request(buildApp()).get('/auth/signin?returnTo=/room/abc123');

    const transaction = readEncryptedSetCookie({
      headers: res.headers,
      name: TRANSACTION_COOKIE_NAME,
      schema: AuthTransactionCookieSchema,
    });
    const location = new URL(res.headers.location);

    expect(transaction?.returnTo).toEqual('/room/abc123');
    expect(transaction?.state).toEqual(location.searchParams.get('state'));
    expect(readSetCookie({ headers: res.headers, name: TRANSACTION_COOKIE_NAME })).toContain(
      'Path=/api/auth/callback/okta'
    );
  });

  it('falls back to "/" when returnTo is not a safe relative path', async () => {
    const res = await request(buildApp()).get('/auth/signin?returnTo=//evil.com');

    const transaction = readEncryptedSetCookie({
      headers: res.headers,
      name: TRANSACTION_COOKIE_NAME,
      schema: AuthTransactionCookieSchema,
    });

    expect(transaction?.returnTo).toEqual('/');
  });
});

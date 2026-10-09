import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import type { Config } from '../../../types/config';
import { TEST_AUTH_COOKIE_SECRET } from '../../../tests/helpers/testAuthCookieSecret';
import makeEncryptedCookieHeader from '../../../tests/helpers/makeEncryptedCookieHeader';
import readSetCookie from '../../../tests/helpers/readSetCookie';

const SESSION_COOKIE_NAME = 'test_session';
const ID_TOKEN_COOKIE_NAME = 'test_id_token';
const TRANSACTION_COOKIE_NAME = 'test_transaction';

const loadConfigMock = jest.fn<() => Config>();
const axiosPostMock = jest.fn<() => Promise<{ status: number }>>();

jest.unstable_mockModule('../../../helpers/config', () => ({
  default: loadConfigMock,
}));

jest.unstable_mockModule('axios', () => ({
  default: { post: axiosPostMock, defaults: {} },
}));

const { default: makeSignOutHandler } = await import('./signOutHandler');

const CONFIG: Config = {
  provider: 'opentok',
  apiKey: 'test-api-key',
  apiSecret: 'test-api-secret',
  sessionKeySecret: 'test-session-key-secret',
  loggerVerbose: false,
  corsAllowedOrigins: ['*'],
  authEnabled: true,
  oidcClientId: 'test-client-id',
  oidcWebRedirectUri: 'http://localhost:3000/api/auth/callback/okta',
  oidcAuthorizationEndpoint: 'https://idp.example.com/authorize',
  oidcTokenEndpoint: 'https://idp.example.com/token',
  oidcIntrospectionEndpoint: 'https://idp.example.com/introspect',
  oidcRevocationEndpoint: 'https://idp.example.com/revoke',
  oidcEndSessionEndpoint: 'https://idp.example.com/logout',
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

const COOKIES = [
  makeEncryptedCookieHeader({
    name: SESSION_COOKIE_NAME,
    payload: {
      accessToken: 'access-1',
      accessTokenExpiresAt: Date.now() + 600_000,
      refreshToken: 'refresh-1',
    },
  }),
  makeEncryptedCookieHeader({ name: ID_TOKEN_COOKIE_NAME, payload: { idToken: 'id-1' } }),
].join('; ');

function signOut(): Promise<request.Response> {
  const app: Express = express();
  app.get('/auth/signout', makeSignOutHandler());

  return request(app).get('/auth/signout').set('Cookie', COOKIES);
}

describe('signOutHandler', () => {
  beforeEach(() => {
    loadConfigMock.mockReturnValue(CONFIG);
    axiosPostMock.mockResolvedValue({ status: 200 });
  });

  it('revokes both tokens, clears the cookies and ends the provider session', async () => {
    const res = await signOut();

    const revokedTokens = axiosPostMock.mock.calls.map((call) =>
      (call as unknown as [string, URLSearchParams])[1].get('token')
    );
    expect(revokedTokens.sort()).toEqual(['access-1', 'refresh-1']);

    const endSessionUrl = new URL(res.headers.location);
    expect(endSessionUrl.origin + endSessionUrl.pathname).toEqual('https://idp.example.com/logout');
    expect(endSessionUrl.searchParams.get('id_token_hint')).toEqual('id-1');
    expect(endSessionUrl.searchParams.get('post_logout_redirect_uri')).toEqual(
      'http://localhost:3000/'
    );

    expect(readSetCookie({ headers: res.headers, name: SESSION_COOKIE_NAME })).toMatch(
      /Expires=Thu, 01 Jan 1970/
    );
  });

  it('still ends the provider session when revocation fails', async () => {
    axiosPostMock.mockRejectedValue(new Error('network error'));

    const res = await signOut();

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toMatch(/^https:\/\/idp\.example\.com\/logout\?/);
  });
});

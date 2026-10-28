import { beforeEach, describe, expect, it, vi } from 'vitest';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import type { Config } from '../../../types/config';
import { TEST_AUTH_COOKIE_SECRET } from '../../../tests/helpers/testAuthCookieSecret';
import makeEncryptedCookieHeader from '../../../tests/helpers/makeEncryptedCookieHeader';
import readSetCookie from '../../../tests/helpers/readSetCookie';

const SESSION_COOKIE_NAME = 'test_session';
const ID_TOKEN_COOKIE_NAME = 'test_id_token';
const TRANSACTION_COOKIE_NAME = 'test_transaction';

const loadConfigMock = vi.fn<[], Config>();
const axiosPostMock = vi.fn<[], Promise<{ status: number }>>();

vi.doMock('../../../helpers/config', () => ({
  default: loadConfigMock,
}));

vi.doMock('axios', () => ({
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
  legacyRoomNameLinksEnabled: true,
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

function makeApp(): Express {
  const app: Express = express();
  app.use(express.json());
  app.post('/auth/signout', makeSignOutHandler());
  app.use((error: { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(error.statusCode ?? 500).end();
  });

  return app;
}

function signOut(): request.Test {
  return request(makeApp()).post('/auth/signout').set('Cookie', COOKIES);
}

function readRevokedTokens(): (string | null)[] {
  return axiosPostMock.mock.calls
    .map((call) => (call as unknown as [string, URLSearchParams])[1].get('token'))
    .sort();
}

describe('signOutHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadConfigMock.mockReturnValue(CONFIG);
    axiosPostMock.mockResolvedValue({ status: 200 });
  });

  it('revokes both tokens, clears the cookies and ends the provider session', async () => {
    const res = await signOut();

    expect(readRevokedTokens()).toEqual(['access-1', 'refresh-1']);
    expect(res.statusCode).toEqual(303);

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

    expect(res.statusCode).toEqual(303);
    expect(res.headers.location).toMatch(/^https:\/\/idp\.example\.com\/logout\?/);
  });

  it('revokes a Bearer access token and its refresh token without cookies or a redirect', async () => {
    const res = await request(makeApp())
      .post('/auth/signout')
      .set('Authorization', 'Bearer mobile-access')
      .send({ refresh_token: 'mobile-refresh' });

    expect(res.statusCode).toEqual(204);
    expect(readRevokedTokens()).toEqual(['mobile-access', 'mobile-refresh']);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('rejects a request from a disallowed origin without revoking anything', async () => {
    loadConfigMock.mockReturnValue({ ...CONFIG, corsAllowedOrigins: ['https://vera.example.com'] });

    const res = await signOut().set('Origin', 'https://evil.example.com');

    expect(res.statusCode).toEqual(403);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });
});

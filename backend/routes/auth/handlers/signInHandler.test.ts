import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import type { Config } from '../../../types/config';
import { TRANSACTION_COOKIE_NAME } from '../constants';

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
  authEnabled: false,
};

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
    expect(location.searchParams.get('client_id')).toEqual('test-web-client-id');
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
});

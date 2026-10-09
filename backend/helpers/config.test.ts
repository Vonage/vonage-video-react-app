import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import loadConfig from './config';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv }; // Copy originalEnv to avoid mutation across tests
    Object.keys(process.env)
      .filter((name) => name.startsWith('AUTH_') || name.startsWith('OIDC_'))
      .forEach((name) => delete process.env[name]);
  });

  test('should return defined values', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';

    const config = loadConfig();
    expect(config.provider).toBe('opentok');

    if (config.provider === 'opentok') {
      expect(config.apiKey).toBe('test-key');
      expect(config.apiSecret).toBe('test-secret');
    }
  });

  test('should throw error for missing OpenTok config values', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = undefined;
    process.env.OT_API_SECRET = undefined;

    expect(() => loadConfig()).toThrow('Missing config values for OpenTok');
  });

  test('should throw error for missing Vonage config values', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'vonage';
    process.env.VONAGE_APP_ID = undefined;
    process.env.VONAGE_PRIVATE_KEY = undefined;

    expect(() => loadConfig()).toThrow('Missing config values for Vonage');
  });

  test('should include videoHost for Vonage config when VONAGE_VIDEO_HOST is set', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'vonage';
    process.env.VONAGE_APP_ID = 'test-app-id';
    process.env.VONAGE_PRIVATE_KEY = 'test-private-key';
    process.env.VONAGE_VIDEO_HOST = 'https://video.api.dev.vonage.com';

    const config = loadConfig();

    expect(config.provider).toBe('vonage');

    if (config.provider === 'vonage') {
      expect(config.applicationId).toBe('test-app-id');
      expect(config.privateKey).toBe('test-private-key');
      expect(config.videoHost).toBe('https://video.api.dev.vonage.com');
    }
  });

  test.each([
    ['missing', undefined],
    ['not an origin', 'vera.example.com'],
    ['an origin with a path', 'https://vera.example.com/app'],
    ['"*" mixed into a list', '*,https://vera.example.com'],
    ['a wildcard outside the first host label', 'https://vera.*.example.com'],
    ['two wildcards', 'https://*-*.example.com'],
  ])('should throw when CORS_ALLOWED_ORIGINS is %s', (_label, value) => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';
    if (value === undefined) delete process.env.CORS_ALLOWED_ORIGINS;
    else process.env.CORS_ALLOWED_ORIGINS = value;

    expect(() => loadConfig()).toThrow(/corsAllowedOrigins/);
  });

  test('should accept "*" on its own', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';
    process.env.CORS_ALLOWED_ORIGINS = '*';

    expect(loadConfig().corsAllowedOrigins).toBe('*');
  });

  test('should parse CORS_ALLOWED_ORIGINS as a comma-separated list', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';
    process.env.CORS_ALLOWED_ORIGINS = 'https://vera.example.com, https://vera-pr-*.example.com';

    expect(loadConfig().corsAllowedOrigins).toEqual([
      'https://vera.example.com',
      'https://vera-pr-*.example.com',
    ]);
  });

  test('should default authEnabled to false when AUTH_ENABLED is unset', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';

    const config = loadConfig();

    expect(config.authEnabled).toBe(false);
  });

  describe('when AUTH_ENABLED is true', () => {
    beforeEach(() => {
      process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
      process.env.OT_API_KEY = 'test-key';
      process.env.OT_API_SECRET = 'test-secret';
      process.env.AUTH_ENABLED = 'true';
      process.env.OIDC_CLIENT_ID = 'test-client-id';
      process.env.OIDC_WEB_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/okta';
      process.env.OIDC_AUTHORIZATION_ENDPOINT = 'https://idp.example.com/authorize';
      process.env.OIDC_TOKEN_ENDPOINT = 'https://idp.example.com/token';
      process.env.OIDC_INTROSPECTION_ENDPOINT = 'https://idp.example.com/introspect';
      process.env.OIDC_REVOCATION_ENDPOINT = 'https://idp.example.com/revoke';
      process.env.OIDC_END_SESSION_ENDPOINT = 'https://idp.example.com/logout';
      process.env.OIDC_POST_LOGOUT_REDIRECT_URI = 'http://localhost:3000/';
      process.env.AUTH_COOKIE_SECRET = Buffer.alloc(32, 7).toString('base64');
      process.env.AUTH_SESSION_COOKIE_NAME = 'vera-session';
      process.env.AUTH_ID_TOKEN_COOKIE_NAME = 'vera-id-token';
      process.env.AUTH_TRANSACTION_COOKIE_NAME = 'vera-sign-in';
      process.env.AUTH_TRANSACTION_MAX_AGE_SECONDS = '600';
      process.env.AUTH_REFRESH_WINDOW_SECONDS = '30';
      process.env.AUTH_PROVIDER_TIMEOUT_MS = '5000';
      process.env.OIDC_SCOPES = 'openid profile email offline_access';
      process.env.AUTH_HEADER_NAME = 'authorization';
      process.env.AUTH_SCHEME = 'Bearer';
    });

    test.each([
      ['OIDC_CLIENT_ID', /oidcClientId/],
      ['OIDC_WEB_REDIRECT_URI', /oidcWebRedirectUri/],
      ['OIDC_AUTHORIZATION_ENDPOINT', /oidcAuthorizationEndpoint/],
      ['OIDC_TOKEN_ENDPOINT', /oidcTokenEndpoint/],
      ['OIDC_INTROSPECTION_ENDPOINT', /oidcIntrospectionEndpoint/],
      ['OIDC_REVOCATION_ENDPOINT', /oidcRevocationEndpoint/],
      ['OIDC_END_SESSION_ENDPOINT', /oidcEndSessionEndpoint/],
      ['OIDC_POST_LOGOUT_REDIRECT_URI', /oidcPostLogoutRedirectUri/],
      ['AUTH_SESSION_COOKIE_NAME', /authSessionCookieName/],
      ['AUTH_PROVIDER_TIMEOUT_MS', /authProviderTimeoutMs/],
    ])('should throw when the required %s is missing', (name, expectedError) => {
      delete process.env[name];

      expect(() => loadConfig()).toThrow(expectedError);
    });

    test.each([
      ['missing', undefined],
      ['not 32 bytes', Buffer.alloc(16, 7).toString('base64')],
    ])('should throw when AUTH_COOKIE_SECRET is %s', (_label, value) => {
      if (value === undefined) delete process.env.AUTH_COOKIE_SECRET;
      else process.env.AUTH_COOKIE_SECRET = value;

      expect(() => loadConfig()).toThrow(/authCookieSecret/);
    });

    test('should throw when an endpoint is not a valid URL', () => {
      process.env.OIDC_TOKEN_ENDPOINT = '/oauth2/v1/token';

      expect(() => loadConfig()).toThrow(/oidcTokenEndpoint/);
    });

    test('should read the project values from env, parsing the numeric ones', () => {
      process.env.AUTH_SESSION_COOKIE_NAME = 'custom_session';
      process.env.AUTH_PROVIDER_TIMEOUT_MS = '9000';

      const config = loadConfig();

      expect(config.authEnabled).toBe(true);
      if (config.authEnabled) {
        expect(config.authSessionCookieName).toBe('custom_session');
        expect(config.authProviderTimeoutMs).toBe(9000);
        expect(config.authRefreshWindowSeconds).toBe(30);
      }
    });
  });
});

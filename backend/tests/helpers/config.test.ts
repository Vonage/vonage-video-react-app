import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import loadConfig from '../../helpers/config';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv }; // Copy originalEnv to avoid mutation across tests
    delete process.env.AUTH_ENABLED;
    delete process.env.OIDC_CLIENT_ID;
    delete process.env.OIDC_WEB_CLIENT_ID;
    delete process.env.OIDC_ISSUER_URL;
    delete process.env.OIDC_WEB_REDIRECT_URI;
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

  test('should default authEnabled to false when AUTH_ENABLED is unset', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';

    const config = loadConfig();

    expect(config.authEnabled).toBe(false);
  });

  test('should throw when AUTH_ENABLED is true but OIDC_CLIENT_ID/OIDC_ISSUER_URL are missing or invalid', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';
    process.env.AUTH_ENABLED = 'true';

    expect(() => loadConfig()).toThrow('OIDC_ISSUER_URL');

    process.env.OIDC_CLIENT_ID = 'test-client-id';
    process.env.OIDC_ISSUER_URL = 'not-a-url';

    expect(() => loadConfig()).toThrow('OIDC_ISSUER_URL');
  });

  test('should throw when AUTH_ENABLED is true but OIDC_WEB_CLIENT_ID is missing', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';
    process.env.AUTH_ENABLED = 'true';
    process.env.OIDC_CLIENT_ID = 'test-client-id';
    process.env.OIDC_ISSUER_URL = 'https://example.okta.com';

    expect(() => loadConfig()).toThrow('OIDC_WEB_CLIENT_ID');
  });

  test('should throw when AUTH_ENABLED is true but OIDC_WEB_REDIRECT_URI is missing or invalid', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';
    process.env.AUTH_ENABLED = 'true';
    process.env.OIDC_CLIENT_ID = 'test-client-id';
    process.env.OIDC_WEB_CLIENT_ID = 'test-web-client-id';
    process.env.OIDC_ISSUER_URL = 'https://example.okta.com';

    expect(() => loadConfig()).toThrow('OIDC_WEB_REDIRECT_URI');

    process.env.OIDC_WEB_REDIRECT_URI = 'not-a-url';

    expect(() => loadConfig()).toThrow('OIDC_WEB_REDIRECT_URI');
  });

  test('should return auth config with defaults, overridable via env, when AUTH_ENABLED is true', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';
    process.env.AUTH_ENABLED = 'true';
    process.env.OIDC_CLIENT_ID = 'test-client-id';
    process.env.OIDC_WEB_CLIENT_ID = 'test-web-client-id';
    process.env.OIDC_ISSUER_URL = 'https://example.okta.com';
    process.env.OIDC_WEB_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/okta';

    const config = loadConfig();

    expect(config.authEnabled).toBe(true);
    if (config.authEnabled) {
      expect(config.oidcWebClientId).toBe('test-web-client-id');
      expect(config.oidcWebRedirectUri).toBe('http://localhost:3000/api/auth/callback/okta');
      expect(config.authHeaderName).toBe('authorization');
      expect(config.authScheme).toBe('Bearer');
      expect(config.introspectPath).toBe('/oauth2/v1/introspect');
      expect(config.authorizePath).toBe('/oauth2/v1/authorize');
      expect(config.tokenPath).toBe('/oauth2/v1/token');
      expect(config.introspectionTimeoutMs).toBe(5000);
    }

    process.env.AUTH_HEADER_NAME = 'x-access-token';
    process.env.AUTH_SCHEME = 'Token';
    process.env.OIDC_INTROSPECT_PATH = '/custom/introspect';
    process.env.OIDC_AUTHORIZE_PATH = '/custom/authorize';
    process.env.OIDC_TOKEN_PATH = '/custom/token';
    process.env.AUTH_INTROSPECTION_TIMEOUT_MS = '9000';

    const overriddenConfig = loadConfig();

    expect(overriddenConfig.authEnabled).toBe(true);
    if (overriddenConfig.authEnabled) {
      expect(overriddenConfig.authHeaderName).toBe('x-access-token');
      expect(overriddenConfig.authScheme).toBe('Token');
      expect(overriddenConfig.introspectPath).toBe('/custom/introspect');
      expect(overriddenConfig.authorizePath).toBe('/custom/authorize');
      expect(overriddenConfig.tokenPath).toBe('/custom/token');
      expect(overriddenConfig.introspectionTimeoutMs).toBe(9000);
    }
  });
});

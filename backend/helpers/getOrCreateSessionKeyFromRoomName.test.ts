import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it } from 'vitest';
import { TEST_AUTH_COOKIE_SECRET } from '../tests/helpers/testAuthCookieSecret';
import mockVonageVideoSdk, { DEFAULT_VALID_SESSION_ID } from '../tests/helpers/mockVonageVideoSdk';

const CURRENT_SIGNING_SECRET = process.env.SESSION_KEY_SECRET!;

const LEGACY_SIGNING_SECRET = 'vonageAppId';

await mockVonageVideoSdk();

const { makeVideoClient$ } = await import('../routes/video');

const getOrCreateSessionKeyFromRoomName = (await import('./getOrCreateSessionKeyFromRoomName'))
  .default;

const sessionService = (await import('../sessionStorageService')).default();

const AUTH_ENABLED_ENV = {
  AUTH_ENABLED: 'true',
  OIDC_CLIENT_ID: 'test-client-id',
  OIDC_WEB_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/okta',
  OIDC_AUTHORIZATION_ENDPOINT: 'https://example.com/authorize',
  OIDC_TOKEN_ENDPOINT: 'https://example.com/token',
  OIDC_INTROSPECTION_ENDPOINT: 'https://example.com/introspect',
  OIDC_REVOCATION_ENDPOINT: 'https://example.com/revoke',
  OIDC_END_SESSION_ENDPOINT: 'https://example.com/logout',
  OIDC_POST_LOGOUT_REDIRECT_URI: 'http://localhost:3000/',
  AUTH_COOKIE_SECRET: TEST_AUTH_COOKIE_SECRET,
  AUTH_SESSION_COOKIE_NAME: 'test_session',
};

const signedInUser = { active: true as const, sub: 'user-1' };

const legacyClaims = {
  sessionId: DEFAULT_VALID_SESSION_ID,
  roomName: 'legacy-room',
  schedule: { startsAt: '2030-01-01T10:00:00.000Z' },
};

describe('getOrCreateSessionKeyFromRoomName with a stored legacy sessionKey', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  const { schedule } = legacyClaims;

  it.each([
    { label: 'auth on and a signed-in user', env: AUTH_ENABLED_ENV, user: signedInUser, schedule },
    { label: 'auth off', env: { AUTH_ENABLED: 'false' }, user: undefined, schedule },
    { label: 'auth on and no user', env: AUTH_ENABLED_ENV, user: undefined, schedule: undefined },
    {
      label: 'LEGACY_SESSION_KEYS_ENABLED false',
      env: { ...AUTH_ENABLED_ENV, LEGACY_SESSION_KEYS_ENABLED: 'false' },
      user: signedInUser,
      schedule: undefined,
    },
  ])(
    'signs a new key, keeping the legacy claims only when allowed, with $label',
    async (testCase) => {
      process.env = { ...originalEnv, ...testCase.env };
      const legacySessionKey = await storeLegacySessionKey();

      const sessionKey = await getOrCreateSessionKeyFromRoomName({
        videoClient: makeVideoClient$(),
        roomName: 'legacy-room',
        user: testCase.user,
      });
      const claims = jwt.verify(sessionKey, CURRENT_SIGNING_SECRET) as Record<string, unknown>;

      expect(sessionKey).not.toEqual(legacySessionKey);
      expect(claims.schedule).toEqual(testCase.schedule);
    }
  );
});

async function storeLegacySessionKey(): Promise<string> {
  const legacySessionKey = jwt.sign(legacyClaims, LEGACY_SIGNING_SECRET);

  await sessionService.setSession({
    roomName: 'legacy-room',
    sessionKey: legacySessionKey,
    sessionId: DEFAULT_VALID_SESSION_ID,
  });

  return legacySessionKey;
}

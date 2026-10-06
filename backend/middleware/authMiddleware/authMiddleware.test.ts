import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import SessionCookieSchema from '../../routes/auth/schemas/SessionCookie.schema';
import { errorHandler } from '../errorHandler';
import { TEST_AUTH_COOKIE_SECRET } from '../../tests/helpers/testAuthCookieSecret';
import makeEncryptedCookieHeader from '../../tests/helpers/makeEncryptedCookieHeader';
import readSetCookie from '../../tests/helpers/readSetCookie';
import readEncryptedSetCookie from '../../tests/helpers/readEncryptedSetCookie';
import authMiddleware from './authMiddleware';

jest.mock('axios');

const mockPost = jest.spyOn(axios, 'post');

const SESSION_COOKIE_NAME = 'test_session';
const CLIENT_ID = 'test-client-id';
const INTROSPECTION_ENDPOINT = 'https://example.com/introspect';
const TOKEN_ENDPOINT = 'https://example.com/token';
const ACTIVE_INTROSPECTION = { active: true, sub: 'user-1', client_id: CLIENT_ID };

function buildApp(): Express {
  const app = express();

  app.use(authMiddleware());
  app.get('/protected', (_req, res) => res.status(200).json({ ok: true }));
  app.use(errorHandler);

  return app;
}

function sessionCookieHeader({
  expiresInSeconds,
  refreshToken,
}: {
  expiresInSeconds: number;
  refreshToken?: string;
}): string {
  return makeEncryptedCookieHeader({
    name: SESSION_COOKIE_NAME,
    payload: {
      accessToken: 'session-access-token',
      accessTokenExpiresAt: Date.now() + expiresInSeconds * 1000,
      ...(refreshToken ? { refreshToken } : {}),
    },
  });
}

/**
 * Routes mocked axios.post calls by URL so introspection and refresh can be scripted separately.
 */
function mockProvider({
  introspection,
  refresh,
}: {
  introspection?: unknown;
  refresh?: { status: number; data: unknown };
}): void {
  mockPost.mockImplementation((url: string) => {
    if (url === INTROSPECTION_ENDPOINT) return Promise.resolve({ data: introspection });
    if (url === TOKEN_ENDPOINT && refresh) return Promise.resolve(refresh);

    return Promise.reject(new Error(`Unexpected request to ${url}`));
  });
}

function postedUrls(): string[] {
  return mockPost.mock.calls.map(([url]) => url);
}

describe('authMiddleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      AUTH_ENABLED: 'true',
      OIDC_CLIENT_ID: CLIENT_ID,
      OIDC_WEB_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/okta',
      OIDC_AUTHORIZATION_ENDPOINT: 'https://example.com/authorize',
      OIDC_TOKEN_ENDPOINT: TOKEN_ENDPOINT,
      OIDC_INTROSPECTION_ENDPOINT: INTROSPECTION_ENDPOINT,
      OIDC_REVOCATION_ENDPOINT: 'https://example.com/revoke',
      OIDC_END_SESSION_ENDPOINT: 'https://example.com/logout',
      OIDC_POST_LOGOUT_REDIRECT_URI: 'http://localhost:3000/',
      AUTH_COOKIE_SECRET: TEST_AUTH_COOKIE_SECRET,
      AUTH_SESSION_COOKIE_NAME: SESSION_COOKIE_NAME,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    mockPost.mockReset();
  });

  it('is a no-op when auth is disabled', async () => {
    process.env.AUTH_ENABLED = 'false';

    const res = await request(buildApp()).get('/protected');

    expect(res.statusCode).toEqual(200);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('throws at construction when auth is enabled but a required field is missing', () => {
    delete process.env.AUTH_COOKIE_SECRET;

    expect(() => authMiddleware()).toThrow();
  });

  it('skips a request path in excludedPaths without introspecting', async () => {
    const app = express();

    app.use(authMiddleware({ excludedPaths: ['/protected'] }));
    app.get('/protected', (_req, res) => res.status(200).json({ ok: true }));
    app.use(errorHandler);

    const res = await request(app).get('/protected');

    expect(res.statusCode).toEqual(200);
    expect(mockPost).not.toHaveBeenCalled();
  });

  describe('unauthenticated requests', () => {
    it('redirects an HTML page request to sign-in, preserving the original URL', async () => {
      const res = await request(buildApp())
        .get('/protected?room=abc')
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');

      expect(res.statusCode).toEqual(302);
      expect(res.headers.location).toEqual(
        `/auth/signin?returnTo=${encodeURIComponent('/protected?room=abc')}`
      );
    });

    it('returns 401 instead of redirecting when the request expects JSON', async () => {
      const res = await request(buildApp()).get('/protected').set('Accept', 'application/json');

      expect(res.statusCode).toEqual(401);
    });

    it('returns 401 for a tampered session cookie without calling the provider', async () => {
      const res = await request(buildApp())
        .get('/protected')
        .set('Cookie', `${SESSION_COOKIE_NAME}=v1.tampered.cookie.value`);

      expect(res.statusCode).toEqual(401);
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe('Bearer header (mobile)', () => {
    it.each([
      ['client_id matches', ACTIVE_INTROSPECTION],
      [
        'client_id is absent and aud includes this client',
        { active: true, sub: 'user-1', aud: ['other', CLIENT_ID] },
      ],
    ])('returns 200 when %s', async (_label, introspection) => {
      mockProvider({ introspection });

      const res = await request(buildApp())
        .get('/protected')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toEqual(200);
      expect(postedUrls()).toEqual([INTROSPECTION_ENDPOINT]);
      expect(res.headers['set-cookie']).toBeUndefined();
    });

    it.each([
      ['token inactive', { active: false }],
      ['issued to a different client_id', { active: true, sub: 'user-2', client_id: 'other-app' }],
      ['client_id and aud are both absent', { active: true, sub: 'user-2' }],
      ['response fails schema validation', { unexpected: 'shape' }],
    ])('returns 401 when %s', async (_label, introspection) => {
      mockProvider({ introspection });

      const res = await request(buildApp())
        .get('/protected')
        .set('Authorization', 'Bearer some-token');

      expect(res.statusCode).toEqual(401);
    });

    it('does not redirect an HTML page request when the provider call fails', async () => {
      mockPost.mockRejectedValue(new Error('network error'));

      const res = await request(buildApp())
        .get('/protected')
        .set('Accept', 'text/html')
        .set('Authorization', 'Bearer some-token');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('session cookie (web)', () => {
    it('introspects a token outside the refresh window and lets the request through', async () => {
      mockProvider({ introspection: ACTIVE_INTROSPECTION });

      const res = await request(buildApp())
        .get('/protected')
        .set('Cookie', sessionCookieHeader({ expiresInSeconds: 600, refreshToken: 'refresh-1' }));

      expect(res.statusCode).toEqual(200);
      expect(postedUrls()).toEqual([INTROSPECTION_ENDPOINT]);
    });

    it('refreshes inside the 30s window without introspecting and writes the rotated session', async () => {
      mockProvider({
        refresh: {
          status: 200,
          data: {
            access_token: 'new-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: 'refresh-2',
          },
        },
      });

      const res = await request(buildApp())
        .get('/protected')
        .set('Cookie', sessionCookieHeader({ expiresInSeconds: 20, refreshToken: 'refresh-1' }));

      expect(res.statusCode).toEqual(200);
      expect(postedUrls()).toEqual([TOKEN_ENDPOINT]);

      const session = readEncryptedSetCookie({
        headers: res.headers,
        name: SESSION_COOKIE_NAME,
        schema: SessionCookieSchema,
      });
      expect(session).toEqual(
        expect.objectContaining({ accessToken: 'new-access-token', refreshToken: 'refresh-2' })
      );
    });

    it('refreshes when introspection reports the token inactive', async () => {
      mockProvider({
        introspection: { active: false },
        refresh: {
          status: 200,
          data: { access_token: 'new-access-token', token_type: 'Bearer', expires_in: 3600 },
        },
      });

      const res = await request(buildApp())
        .get('/protected')
        .set('Cookie', sessionCookieHeader({ expiresInSeconds: 600, refreshToken: 'refresh-1' }));

      expect(res.statusCode).toEqual(200);
      expect(postedUrls()).toEqual([INTROSPECTION_ENDPOINT, TOKEN_ENDPOINT]);
    });

    it('keeps a live session when a parallel request already rotated the refresh token', async () => {
      mockProvider({
        introspection: ACTIVE_INTROSPECTION,
        refresh: { status: 400, data: { error: 'invalid_grant' } },
      });

      const res = await request(buildApp())
        .get('/protected')
        .set('Cookie', sessionCookieHeader({ expiresInSeconds: 20, refreshToken: 'refresh-1' }));

      expect(res.statusCode).toEqual(200);
      expect(readSetCookie({ headers: res.headers, name: SESSION_COOKIE_NAME })).toBeUndefined();
    });

    it('signs out an expired session whose refresh token was rejected', async () => {
      mockProvider({ refresh: { status: 400, data: { error: 'invalid_grant' } } });

      const cookie = sessionCookieHeader({ expiresInSeconds: -5, refreshToken: 'refresh-1' });

      const pageResponse = await request(buildApp())
        .get('/protected')
        .set('Accept', 'text/html')
        .set('Cookie', cookie);
      const apiResponse = await request(buildApp())
        .get('/protected')
        .set('Accept', 'application/json')
        .set('Cookie', cookie);

      expect(pageResponse.statusCode).toEqual(302);
      expect(apiResponse.statusCode).toEqual(401);
      expect(readSetCookie({ headers: apiResponse.headers, name: SESSION_COOKIE_NAME })).toMatch(
        /Expires=Thu, 01 Jan 1970/
      );
    });

    it('does not redirect when the refresh request itself fails', async () => {
      mockPost.mockRejectedValue(new Error('network error'));

      const res = await request(buildApp())
        .get('/protected')
        .set('Accept', 'text/html')
        .set('Cookie', sessionCookieHeader({ expiresInSeconds: 20, refreshToken: 'refresh-1' }));

      expect(res.statusCode).toEqual(502);
    });
  });
});

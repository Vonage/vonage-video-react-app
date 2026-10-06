import { afterAll, afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import axios from 'axios';
import request from 'supertest';
import { Server } from 'http';
import { TEST_AUTH_COOKIE_SECRET } from './helpers/testAuthCookieSecret';
import makeEncryptedCookieHeader from './helpers/makeEncryptedCookieHeader';
import mockVonageVideoSdk, { DEFAULT_CAPTIONS_ID } from './helpers/mockVonageVideoSdk';

const SESSION_COOKIE_NAME = 'test_session';
const OIDC_CLIENT_ID = 'test-client-id';
const introspectionResponse = { data: { active: true, sub: 'user-1', client_id: OIDC_CLIENT_ID } };

const originalEnv = process.env;
process.env = {
  ...originalEnv,
  AUTH_ENABLED: 'true',
  OIDC_CLIENT_ID: OIDC_CLIENT_ID,
  OIDC_WEB_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/okta',
  OIDC_AUTHORIZATION_ENDPOINT: 'https://example.com/authorize',
  OIDC_TOKEN_ENDPOINT: 'https://example.com/token',
  OIDC_INTROSPECTION_ENDPOINT: 'https://example.com/introspect',
  OIDC_REVOCATION_ENDPOINT: 'https://example.com/revoke',
  OIDC_END_SESSION_ENDPOINT: 'https://example.com/logout',
  OIDC_POST_LOGOUT_REDIRECT_URI: 'http://localhost:3000/',
  AUTH_COOKIE_SECRET: TEST_AUTH_COOKIE_SECRET,
  AUTH_SESSION_COOKIE_NAME: SESSION_COOKIE_NAME,
};

jest.mock('axios');
const mockPost = jest.spyOn(axios, 'post');

await mockVonageVideoSdk();

const startServer = (await import('../server')).default;

/**
 * Proves the v1 `session.ts` routes are wired into the app-wide `authMiddleware` gate from
 * server.ts.
 */
describe('v1 session routes are protected by authMiddleware when AUTH_ENABLED=true', () => {
  let server: Server;
  const roomName = 'auth-wired-room';
  const captionsId = DEFAULT_CAPTIONS_ID;
  const archiveId = 'archive-1';

  const routes: Array<{ name: string; method: 'get' | 'post'; path: string }> = [
    { name: 'GET /session/:room', method: 'get', path: `/session/${roomName}` },
    {
      name: 'POST /session/:room/startArchive',
      method: 'post',
      path: `/session/${roomName}/startArchive`,
    },
    {
      name: 'POST /session/:room/:archiveId/stopArchive',
      method: 'post',
      path: `/session/${roomName}/${archiveId}/stopArchive`,
    },
    { name: 'GET /session/:room/archives', method: 'get', path: `/session/${roomName}/archives` },
    {
      name: 'POST /session/:room/enableCaptions',
      method: 'post',
      path: `/session/${roomName}/enableCaptions`,
    },
    {
      name: 'POST /session/:room/:captionsId/disableCaptions',
      method: 'post',
      path: `/session/${roomName}/${captionsId}/disableCaptions`,
    },
  ];

  beforeAll(async () => {
    server = await startServer(0);

    mockPost.mockResolvedValueOnce(introspectionResponse);
    const primeResponse = await request(server)
      .get(`/session/${roomName}`)
      .set('Authorization', 'Bearer valid-token');
    mockPost.mockReset();

    expect(primeResponse.statusCode).toEqual(200);
  });

  afterAll((done) => {
    process.env = originalEnv;
    server.close(done);
  });

  afterEach(() => {
    mockPost.mockReset();
  });

  it.each(routes)('$name returns 401 with no token and no cookie', async ({ method, path }) => {
    const res = await request(server)[method](path).set('Content-Type', 'application/json');

    expect(res.statusCode).toEqual(401);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it.each(routes)(
    '$name returns 200 with a valid Bearer token (mobile path)',
    async ({ method, path }) => {
      mockPost.mockResolvedValue(introspectionResponse);

      const res = await request(server)
        [method](path)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toEqual(200);
    }
  );

  it('GET /session/:room/archives returns 200 with a valid session cookie (web path)', async () => {
    mockPost.mockResolvedValue(introspectionResponse);

    const res = await request(server)
      .get(`/session/${roomName}/archives`)
      .set(
        'Cookie',
        makeEncryptedCookieHeader({
          name: SESSION_COOKIE_NAME,
          payload: { accessToken: 'session-token', accessTokenExpiresAt: Date.now() + 600_000 },
        })
      );

    expect(res.statusCode).toEqual(200);
  });
});

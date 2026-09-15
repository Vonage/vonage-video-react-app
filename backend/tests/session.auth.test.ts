import { afterAll, afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import axios from 'axios';
import request from 'supertest';
import { Server } from 'http';
import getSessionStorageService from '../sessionStorageService';
import { SESSION_COOKIE_NAME } from '../routes/auth/constants';
import mockVonageVideoSdk, { DEFAULT_CAPTIONS_ID } from './helpers/mockVonageVideoSdk';

const OIDC_CLIENT_ID = 'test-client-id';
const introspectionResponse = { data: { active: true, sub: 'user-1', client_id: OIDC_CLIENT_ID } };

const originalEnv = process.env;
process.env = {
  ...originalEnv,
  AUTH_ENABLED: 'true',
  OIDC_ISSUER_URL: 'https://example.com',
  OIDC_CLIENT_ID: OIDC_CLIENT_ID,
  OIDC_WEB_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/okta',
};

jest.mock('axios');
const mockPost = jest.spyOn(axios, 'post');

await mockVonageVideoSdk();

const startServer = (await import('../server')).default;
const sessionService = getSessionStorageService();

/**
 * Proves the 5 v1 `session.ts` routes are actually wired into the app-wide `authMiddleware`
 * gate from server.ts — introspection logic itself (inactive token, client_id mismatch, etc.)
 * is already covered by authMiddleware.test.ts and is not re-tested here.
 */
describe('v1 session routes are protected by authMiddleware when AUTH_ENABLED=true', () => {
  let server: Server;
  const roomName = 'auth-wired-room';
  const captionsId = DEFAULT_CAPTIONS_ID;
  const archiveId = 'archive-1';

  const routes: Array<{ name: string; method: 'get' | 'post'; path: string }> = [
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

    // Primes the room the same way the app would — a real join creates the session and
    // registers the sessionId → sessionKey mapping (via videoHandler's onSettled$ hook) — rather
    // than hand-crafting storage state that could drift out of sync with what decodeSessionKey
    // actually returns.
    mockPost.mockResolvedValueOnce(introspectionResponse);
    await request(server).get(`/session/${roomName}`).set('Authorization', 'Bearer valid-token');
    mockPost.mockReset();
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
    await sessionService.setAccessToken({
      sessionId: 'v1-cookie-session',
      accessToken: 'session-token',
    });

    const res = await request(server)
      .get(`/session/${roomName}/archives`)
      .set('Cookie', `${SESSION_COOKIE_NAME}=v1-cookie-session`);

    expect(res.statusCode).toEqual(200);
  });
});

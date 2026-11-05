import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import express, { type Express } from 'express';
import request from 'supertest';
import { errorHandler } from '../../middleware/errorHandler';
import authMiddleware from '../../middleware/authMiddleware/authMiddleware';
import { TEST_AUTH_COOKIE_SECRET } from '../../tests/helpers/testAuthCookieSecret';
import mockVonageVideoSdk from '../../tests/helpers/mockVonageVideoSdk';

vi.mock('axios');

const mockPost = vi.spyOn(axios, 'post');

const OIDC_CLIENT_ID = 'test-client-id';

await mockVonageVideoSdk();

const videoRouter = (await import('.')).default;

function buildApp(): Express {
  const app = express();

  app.set('trust proxy', true);
  app.use(express.json());
  app.use('/v2', authMiddleware({ mode: 'optional' }), videoRouter);
  app.use(errorHandler);

  return app;
}

function createSessionAsSignedInUser({ app, roomName }: { app: Express; roomName: string }) {
  mockPost.mockResolvedValueOnce({
    status: 200,
    data: { active: true, sub: 'user-1', client_id: OIDC_CLIENT_ID },
  });

  return request(app)
    .post('/v2/createSession')
    .set('Authorization', 'Bearer valid-token')
    .send({ roomName });
}

describe('video route access policy', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    mockPost.mockReset();
  });

  it('with auth disabled, creates a room by name and joins the same room again', async () => {
    process.env = { ...originalEnv, AUTH_ENABLED: 'false' };
    const app = buildApp();

    const created = await request(app).post('/v2/createSession').send({ roomName: 'open-room' });
    const joined = await request(app).post('/v2/createSession').send({ roomName: 'open-room' });

    expect(joined.statusCode).toEqual(200);
    expect(joined.body.result.data.sessionKey).toEqual(created.body.result.data.sessionKey);
  });

  describe('with auth enabled', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AUTH_ENABLED: 'true',
        OIDC_CLIENT_ID,
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
    });

    it('rejects an anonymous caller creating or joining a room by name', async () => {
      const res = await request(buildApp())
        .post('/v2/createSession')
        .send({ roomName: 'guessed-room' });

      expect(res.statusCode).toEqual(401);
    });

    it('lets a signed-in user create a room, and an anonymous holder of its sessionKey join it', async () => {
      const app = buildApp();
      const created = await createSessionAsSignedInUser({ app, roomName: 'shared-room' });
      const { sessionKey } = created.body.result.data as { sessionKey: string };

      const joined = await request(app).post('/v2/joinSession').send({ sessionKey });

      expect(created.statusCode).toEqual(200);
      expect(joined.statusCode).toEqual(200);
    });

    it('limits anonymous createSessionAndJoin calls per IP, but not a signed-in user', async () => {
      const app = buildApp();
      const created = await createSessionAsSignedInUser({ app, roomName: 'limited-room' });
      const { sessionKey } = created.body.result.data as { sessionKey: string };
      const callAnonymously = () =>
        request(app)
          .post('/v2/createSessionAndJoin')
          .set('X-Forwarded-For', '203.0.113.10')
          .send({ sessionKey });

      const allowedStatuses: number[] = [];
      for (let attempt = 0; attempt < 5; attempt++) {
        allowedStatuses.push((await callAnonymously()).statusCode);
      }
      const limited = await callAnonymously();

      mockPost.mockResolvedValueOnce({
        status: 200,
        data: { active: true, sub: 'user-1', client_id: OIDC_CLIENT_ID },
      });
      const signedIn = await request(app)
        .post('/v2/createSessionAndJoin')
        .set('X-Forwarded-For', '203.0.113.10')
        .set('Authorization', 'Bearer valid-token')
        .send({ sessionKey });

      expect(allowedStatuses).toEqual([200, 200, 200, 200, 200]);
      expect(limited.statusCode).toEqual(429);
      expect(signedIn.statusCode).toEqual(200);
    });

    it('rejects an anonymous caller without a valid sessionKey on any other action', async () => {
      const res = await request(buildApp())
        .post('/v2/joinSession')
        .send({ sessionKey: 'not-a-session-key' });

      expect(res.statusCode).toEqual(401);
    });
  });
});

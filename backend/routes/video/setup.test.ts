import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import express, { type Express } from 'express';
import request from 'supertest';
import { errorHandler } from '../../middleware/errorHandler';
import authMiddleware from '../../middleware/authMiddleware/authMiddleware';
import { TEST_AUTH_COOKIE_SECRET } from '../../tests/helpers/testAuthCookieSecret';
import makeEncryptedCookieHeader from '../../tests/helpers/makeEncryptedCookieHeader';
import mockVonageVideoSdk, {
  DEFAULT_VALID_SESSION_ID,
} from '../../tests/helpers/mockVonageVideoSdk';
import jwt from 'jsonwebtoken';

vi.mock('axios');

const mockPost = vi.spyOn(axios, 'post');

const OIDC_CLIENT_ID = 'test-client-id';

const CURRENT_SIGNING_SECRET = process.env.SESSION_KEY_SECRET!;

const LEGACY_SIGNING_SECRET = 'vonageAppId';

await mockVonageVideoSdk();

const videoRouter = (await import('.')).default;

const sessionService = (await import('../../sessionStorageService')).default();

function buildApp(): Express {
  const app = express();

  app.set('trust proxy', true);
  app.use(express.json());
  app.use('/v2', authMiddleware({ mode: 'optional' }), videoRouter);
  app.use(errorHandler);

  return app;
}

function joinSessionAsSignedInUser({ app, sessionKey }: { app: Express; sessionKey: string }) {
  mockPost.mockResolvedValueOnce({
    status: 200,
    data: { active: true, sub: 'user-1', client_id: OIDC_CLIENT_ID },
  });

  return request(app)
    .post('/v2/joinSession')
    .set('Authorization', 'Bearer valid-token')
    .send({ sessionKey });
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

  it('with auth disabled, does not limit createSessionAndJoin calls', async () => {
    process.env = { ...originalEnv, AUTH_ENABLED: 'false' };
    const app = buildApp();
    const created = await request(app).post('/v2/createSession').send({ roomName: 'open-test' });
    const { sessionKey } = created.body.result.data as { sessionKey: string };

    const statuses: number[] = [];
    for (let attempt = 0; attempt < 6; attempt++) {
      const response = await request(app)
        .post('/v2/createSessionAndJoin')
        .set('X-Forwarded-For', '203.0.113.30')
        .send({ sessionKey });
      statuses.push(response.statusCode);
    }

    expect(statuses).toEqual([200, 200, 200, 200, 200, 200]);
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

    it.each([
      { action: 'createSession', body: { roomName: 'guessed-room' } },
      { action: 'joinSession', body: { sessionKey: 'not-a-session-key' } },
    ])(
      'rejects an anonymous caller of $action without a valid sessionKey',
      async ({ action, body }) => {
        const res = await request(buildApp()).post(`/v2/${action}`).send(body);

        expect(res.statusCode).toEqual(401);
      }
    );

    it('lets a signed-in user create a room, and an anonymous holder of its sessionKey join it', async () => {
      const app = buildApp();
      const created = await createSessionAsSignedInUser({ app, roomName: 'shared-room' });
      const { sessionKey } = created.body.result.data as { sessionKey: string };

      const joined = await request(app).post('/v2/joinSession').send({ sessionKey });

      expect(created.statusCode).toEqual(200);
      expect(joined.statusCode).toEqual(200);
    });

    it('lets an anonymous holder of a sessionKey run createSessionAndJoin, but not open another room by name', async () => {
      const app = buildApp();
      const created = await createSessionAsSignedInUser({ app, roomName: 'room-a' });
      const { sessionKey } = created.body.result.data as { sessionKey: string };

      const networkTest = await request(app).post('/v2/createSessionAndJoin').send({ sessionKey });
      const otherRoom = await request(app)
        .post('/v2/createSession')
        .send({ sessionKey, roomName: 'room-b' });

      expect(networkTest.statusCode).toEqual(200);
      expect(otherRoom.statusCode).toEqual(401);
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
      expect(limited.body.error.message).toEqual(
        'Too many sessions created, please try again later.'
      );
      expect(signedIn.statusCode).toEqual(200);
    });

    it('counts each createSessionAndJoin call in a batch against the anonymous limit', async () => {
      const app = buildApp();
      const created = await createSessionAsSignedInUser({ app, roomName: 'batched-room' });
      const { sessionKey } = created.body.result.data as { sessionKey: string };
      const callAnonymously = () =>
        request(app)
          .post('/v2/createSessionAndJoin')
          .set('X-Forwarded-For', '203.0.113.20')
          .send({ sessionKey });

      const batch = await request(app)
        .post('/v2/createSessionAndJoin,createSessionAndJoin?batch=1')
        .set('X-Forwarded-For', '203.0.113.20')
        .send({ 0: { sessionKey }, 1: { sessionKey } });
      const allowedStatuses: number[] = [];
      for (let attempt = 0; attempt < 3; attempt++) {
        allowedStatuses.push((await callAnonymously()).statusCode);
      }
      const limited = await callAnonymously();

      expect(batch.statusCode).toEqual(200);
      expect(allowedStatuses).toEqual([200, 200, 200]);
      expect(limited.statusCode).toEqual(429);
    });

    it('returns a provider error instead of 401 when the identity provider fails for a session cookie', async () => {
      mockPost.mockRejectedValue(new Error('connect ECONNREFUSED'));
      const sessionCookie = makeEncryptedCookieHeader({
        name: 'test_session',
        payload: {
          accessToken: 'session-access-token',
          accessTokenExpiresAt: Date.now() + 3600 * 1000,
        },
      });

      const res = await request(buildApp())
        .post('/v2/createSession')
        .set('Cookie', sessionCookie)
        .send({ roomName: 'some-room' });

      expect(res.statusCode).toEqual(502);
    });

    describe('with a sessionKey signed with the Application ID', () => {
      const legacyClaims = {
        sessionId: DEFAULT_VALID_SESSION_ID,
        roomName: 'legacy-room',
        schedule: { startsAt: '2030-01-01T10:00:00.000Z' },
      };
      const legacySessionKey = jwt.sign(legacyClaims, LEGACY_SIGNING_SECRET);

      it('re-signs it for a signed-in user, keeps every claim and replaces the stored entry', async () => {
        const res = await joinSessionAsSignedInUser({
          app: buildApp(),
          sessionKey: legacySessionKey,
        });
        const { sessionKey } = res.body.result.data as { sessionKey: string };

        expect(res.statusCode).toEqual(200);
        expect(sessionKey).not.toEqual(legacySessionKey);
        expect(jwt.verify(sessionKey, CURRENT_SIGNING_SECRET)).toMatchObject(legacyClaims);
        expect(
          await sessionService.getSessionKeyBySessionId({ sessionId: DEFAULT_VALID_SESSION_ID })
        ).toEqual(sessionKey);
      });

      it('re-signs the key stored for a room name and replaces it', async () => {
        await sessionService.setSession({
          roomName: 'legacy-room',
          sessionKey: legacySessionKey,
          sessionId: DEFAULT_VALID_SESSION_ID,
        });

        const res = await createSessionAsSignedInUser({ app: buildApp(), roomName: 'legacy-room' });
        const { sessionKey, sessionId } = res.body.result.data as {
          sessionKey: string;
          sessionId: string;
        };

        expect(res.statusCode).toEqual(200);
        expect(sessionId).toEqual(DEFAULT_VALID_SESSION_ID);
        expect(jwt.verify(sessionKey, CURRENT_SIGNING_SECRET)).toMatchObject(legacyClaims);
        expect(await sessionService.getSessionKeyByRoomName({ roomName: 'legacy-room' })).toEqual(
          sessionKey
        );
      });

      it('rejects it for an anonymous caller', async () => {
        const res = await request(buildApp())
          .post('/v2/joinSession')
          .send({ sessionKey: legacySessionKey });

        expect(res.statusCode).toEqual(401);
      });

      it('rejects it for a signed-in user when LEGACY_SESSION_KEYS_ENABLED is false', async () => {
        process.env.LEGACY_SESSION_KEYS_ENABLED = 'false';

        const res = await joinSessionAsSignedInUser({
          app: buildApp(),
          sessionKey: legacySessionKey,
        });

        expect(res.statusCode).toEqual(400);
      });
    });

    it('returns a sessionKey signed with the current secret unchanged', async () => {
      const sessionKey = jwt.sign({ sessionId: DEFAULT_VALID_SESSION_ID }, CURRENT_SIGNING_SECRET);

      const res = await joinSessionAsSignedInUser({ app: buildApp(), sessionKey });

      expect(res.statusCode).toEqual(200);
      expect(res.body.result.data.sessionKey).toEqual(sessionKey);
    });

    it('creates a new session for a room whose stored key verifies with neither secret', async () => {
      const unverifiableSessionKey = jwt.sign(
        { sessionId: DEFAULT_VALID_SESSION_ID, roomName: 'stale-room' },
        'unknown-secret'
      );
      await sessionService.setSession({
        roomName: 'stale-room',
        sessionKey: unverifiableSessionKey,
        sessionId: DEFAULT_VALID_SESSION_ID,
      });

      const res = await createSessionAsSignedInUser({ app: buildApp(), roomName: 'stale-room' });
      const { sessionKey } = res.body.result.data as { sessionKey: string };

      expect(res.statusCode).toEqual(200);
      expect(jwt.verify(sessionKey, CURRENT_SIGNING_SECRET)).toMatchObject({
        roomName: 'stale-room',
      });
      expect(await sessionService.getSessionKeyByRoomName({ roomName: 'stale-room' })).toEqual(
        sessionKey
      );
    });
  });
});

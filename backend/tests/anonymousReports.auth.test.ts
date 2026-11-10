import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import closeServer from './helpers/closeServer';
import axios from 'axios';
import request from 'supertest';
import { Server } from 'http';
import { TEST_AUTH_COOKIE_SECRET } from './helpers/testAuthCookieSecret';
import mockVonageVideoSdk from './helpers/mockVonageVideoSdk';

const OIDC_CLIENT_ID = 'test-client-id';

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
  AUTH_SESSION_COOKIE_NAME: 'test_session',
};

vi.mock('axios');

const mockPost = vi.spyOn(axios, 'post');

vi.doMock('../services/getFeedbackService.ts', () => ({
  default: vi.fn(() => ({
    reportIssue: vi.fn().mockResolvedValue({ message: 'created', ticketUrl: 'https://jira.com' }),
  })),
}));

await mockVonageVideoSdk();

const startServer = (await import('../server')).default;

const logPayload = {
  action: 'vonageVideoClient.connect.success',
  variation: 'Success',
  clientSystemTime: Date.now(),
  source: 'https://example.com',
  guid: '0f8fad5b-d9cb-469f-a165-70867728950e',
  userAgent: 'Mozilla/5.0',
  level: 'info',
};

describe('anonymous reports when AUTH_ENABLED=true', () => {
  let server: Server;

  beforeAll(async () => {
    server = await startServer(0);
  });

  afterAll(() => {
    process.env = originalEnv;
    return closeServer(server);
  });

  it('accepts logs and feedback from an anonymous caller up to the anonymous limit, and does not limit a signed-in user', async () => {
    mockPost.mockResolvedValue({
      status: 200,
      data: { active: true, sub: 'user-1', client_id: OIDC_CLIENT_ID },
    });

    const feedback = await request(server)
      .post('/feedback/report')
      .send({ title: 'Audio', name: 'Anonymous', issue: 'No audio', attachment: '' });

    const logStatuses: number[] = [];
    for (let attempt = 0; attempt < 59; attempt++) {
      logStatuses.push((await request(server).post('/client-logs').send(logPayload)).statusCode);
    }

    const limited = await request(server).post('/client-logs').send(logPayload);
    const signedIn = await request(server)
      .post('/client-logs')
      .set('Authorization', 'Bearer valid-token')
      .send(logPayload);

    expect(feedback.statusCode).toEqual(200);
    expect(new Set(logStatuses)).toEqual(new Set([204]));
    expect(limited.statusCode).toEqual(429);
    expect(signedIn.statusCode).toEqual(204);
  });
});

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';

// This needs to be set before the server is imported
// and the import of the startServer cannot happen inside describe
process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
process.env.AUTH_ENABLED = 'true';
process.env.OIDC_CLIENT_ID = 'test-client-id';
process.env.OIDC_ISSUER_URL = 'https://example.com';
const startServer = (await import('../server')).default;

describe('authMiddleware, mounted on the real app', () => {
  let server: Server;

  beforeAll(async () => {
    server = await startServer(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('rejects an unauthenticated POST /v2/createSession with a real 401 response', async () => {
    const res = await request(server).post('/v2/createSession').send({});

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  it('rejects an unauthenticated POST /v2/joinSession with a real 401 response', async () => {
    const res = await request(server).post('/v2/joinSession').send({});

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message');
  });
});

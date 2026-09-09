import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';

// Must be set before the server (and its cors middleware) is imported.
process.env.CORS_ALLOWED_ORIGINS = 'https://allowed.example';
process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
const startServer = (await import('../server')).default;

describe('CORS allowlist', () => {
  let server: Server;

  beforeAll(async () => {
    server = await startServer(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('echoes the origin for an allowed origin', async () => {
    const res = await request(server).get('/_/health').set('Origin', 'https://allowed.example');

    expect(res.headers['access-control-allow-origin']).toBe('https://allowed.example');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('does not reflect a disallowed origin (no wildcard credentialed access)', async () => {
    const res = await request(server).get('/_/health').set('Origin', 'https://evil.example');

    // The disallowed origin must NOT be echoed back — otherwise any site could make
    // credentialed cross-origin requests.
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('allows requests with no Origin header (same-origin / server-to-server)', async () => {
    const res = await request(server).get('/_/health');

    expect(res.statusCode).toBe(200);
  });
});

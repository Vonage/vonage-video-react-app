import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';

// This needs to be set before the server is imported
// and the import of the startServer cannot happen inside describe
process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
const startServer = (await import('../server')).default;

describe('GET /_/health', () => {
  let server: Server;

  beforeAll(async () => {
    server = await startServer();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('returns a 200', async () => {
    const res = await request(server).get('/_/health');
    expect(res.statusCode).toEqual(200);
  });
});

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';

process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
const startServer = (await import('../server')).default;

describe('GET /.well-known/apple-app-site-association', () => {
  let server: Server;

  beforeAll(async () => {
    server = await startServer();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('returns a 200 status code', async () => {
    const res = await request(server).get('/.well-known/apple-app-site-association');
    expect(res.statusCode).toEqual(200);
  });

  it('returns the correct Content-Type header', async () => {
    const res = await request(server).get('/.well-known/apple-app-site-association');
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
  });

  it('returns valid JSON content', async () => {
    const res = await request(server).get('/.well-known/apple-app-site-association');
    expect(() => JSON.parse(res.text)).not.toThrow();
  });

  it('returns the correct structure for asset links', async () => {
    const res = await request(server).get('/.well-known/apple-app-site-association');
    const json = JSON.parse(res.text);

    expect(json).toEqual(
      expect.objectContaining({
        applinks: expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              appIDs: expect.arrayContaining(['PR6C39UQ38.com.vonage.VERA']),
              components: expect.arrayContaining([
                expect.objectContaining({
                  '/': '/waiting-room/*',
                }),
                expect.objectContaining({
                  '/': '/room/*',
                  comment: 'Matches any room URL',
                }),
              ]),
            }),
          ]),
        }),
        webcredentials: expect.objectContaining({
          apps: expect.arrayContaining(['PR6C39UQ38.com.vonage.VERA']),
        }),
      })
    );
  });
});

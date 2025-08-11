import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';

process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
const startServer = (await import('../server')).default;

describe('GET /.well-known/assetlinks.json', () => {
  let server: Server;

  beforeAll(async () => {
    server = await startServer();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('returns a 200 status code', async () => {
    const res = await request(server).get('/.well-known/assetlinks.json');
    expect(res.statusCode).toEqual(200);
  });

  it('returns the correct Content-Type header', async () => {
    const res = await request(server).get('/.well-known/assetlinks.json');
    expect(res.headers['content-type']).toEqual('application/json; charset=UTF-8');
  });

  it('returns valid JSON content', async () => {
    const res = await request(server).get('/.well-known/assetlinks.json');
    expect(() => JSON.parse(res.text)).not.toThrow();
  });

  it('returns the same content as the static assetlinks.json file', async () => {
    const res = await request(server).get('/.well-known/assetlinks.json');
    const expectedContent = (await import('../.well-known/assetlinks.json')).default;
    expect(JSON.parse(res.text)).toEqual(expectedContent);
  });
});

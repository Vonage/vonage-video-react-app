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
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
  });

  it('returns valid JSON content', async () => {
    const res = await request(server).get('/.well-known/assetlinks.json');
    expect(() => JSON.parse(res.text)).not.toThrow();
  });

  it('returns the correct structure for asset links', async () => {
    const res = await request(server).get('/.well-known/assetlinks.json');
    const json = JSON.parse(res.text);
    expect(json).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relation: expect.arrayContaining(['delegate_permission/common.handle_all_urls']),
          target: expect.objectContaining({
            namespace: 'android_app',
            package_name: 'com.vonage.android.debug',
            sha256_cert_fingerprints: expect.arrayContaining([
              'A4:26:72:80:DA:75:99:75:ED:D2:32:ED:0A:DC:2C:7C:27:78:6A:8C:9A:37:22:41:23:CF:9E:DB:03:78:FC:6C',
            ]),
          }),
        }),
        expect.objectContaining({
          relation: expect.arrayContaining(['delegate_permission/common.handle_all_urls']),
          target: expect.objectContaining({
            namespace: 'android_app',
            package_name: 'com.vonage.android',
            sha256_cert_fingerprints: expect.arrayContaining([
              'A5:77:34:82:4C:98:13:CF:88:DF:20:46:2C:B7:7E:33:C0:4C:FC:C6:A1:E4:B3:25:5F:43:49:BA:FE:B5:43:27',
            ]),
          }),
        }),
      ])
    );
  });
});

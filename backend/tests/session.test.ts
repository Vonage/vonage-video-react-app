import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import { Archive } from 'opentok';
import InMemorySessionStorage from '../storage/inMemorySessionStorage'; // Import the session storage
import mockOpentokConfig from '../helpers/__mocks__/config';

await jest.unstable_mockModule('../helpers/config', mockOpentokConfig);

const mockVcrSessionStorage = {
  getSession: jest.fn().mockReturnValue('someSessionId'),
  setSession: jest.fn().mockReturnValue(true),
};

jest.mock('../storage/vcrSessionStorage', () => {
  return jest.fn().mockImplementation(() => mockVcrSessionStorage);
});

await jest.unstable_mockModule('../videoService/opentokVideoService.ts', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        startArchive: jest.fn<() => Promise<string>>().mockResolvedValue('archiveId'),
        stopArchive: jest.fn<() => Promise<string>>().mockRejectedValue('invalid archive'),
        generateToken: jest
          .fn<() => Promise<{ token: string; apiKey: string }>>()
          .mockResolvedValue({
            token: 'someToken',
            apiKey: 'someApiKey',
          }),
        createSession: jest.fn<() => Promise<string>>().mockResolvedValue('someSessionId'),
        listArchives: jest
          .fn<() => Promise<Archive[]>>()
          .mockResolvedValue([{ id: 'archive1' }, { id: 'archive2' }] as unknown as Archive[]),
      };
    }),
  };
});

const startServer = (await import('../server')).default;

describe.each([
  ['InMemorySessionStorage', new InMemorySessionStorage()],
  ['VcrSessionStorage', mockVcrSessionStorage],
])('/session using %s', (storageName, sessionStorage) => {
  let server: Server;
  const roomName = 'awesomeRoomName';

  beforeAll(async () => {
    server = await startServer();
    await sessionStorage.setSession('awesomeRoomName', 'someSessionId');
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET requests', () => {
    it('returns a 200 when creating a room', async () => {
      const res = await request(server).get(`/session/${roomName}`);
      expect(res.statusCode).toEqual(200);
    });

    it('returns a 200 and a list of archives when getting archives', async () => {
      await sessionStorage.setSession('awesomeRoomName', 'someSessionId');
      const res = await request(server).get(`/session/${roomName}/archives`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.archives).toEqual([{ id: 'archive1' }, { id: 'archive2' }]);
    });
  });

  describe('POST requests', () => {
    it('returns a 200 when starting an archive in a room', async () => {
      const res = await request(server)
        .post(`/session/${roomName}/startArchive`)
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toEqual(200);
    });

    it('returns a 404 when starting an archive in a non-existent room', async () => {
      const invalidRoomName = 'nonExistingRoomName';
      const res = await request(server)
        .post(`/session/${invalidRoomName}/startArchive`)
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toEqual(404);
    });

    it('returns a 500 when stopping an invalid archive in a room', async () => {
      const archiveId = 'b8-c9-d10';
      const res = await request(server)
        .post(`/session/${roomName}/${archiveId}/stopArchive`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      expect(res.statusCode).toEqual(500);
    });
  });
});

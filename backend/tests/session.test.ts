import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import { Archive } from 'opentok';
import InMemorySessionStorage from '../storage/inMemorySessionStorage';
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
        enableCaptions: jest.fn<() => Promise<string>>().mockResolvedValue('captionsId'),
        disableCaptions: jest.fn<() => Promise<string>>().mockResolvedValue('invalid caption'),
        generateToken: jest
          .fn<() => Promise<{ token: string; apiKey: string; tokenRole: string }>>()
          .mockResolvedValue({
            token: 'someToken',
            apiKey: 'someApiKey',
            tokenRole: 'moderator',
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
])('/session using %s', (_storageName, sessionStorage) => {
  let server: Server;
  const roomName = 'awesomeRoomName';

  beforeAll(async () => {
    server = await startServer();
    await sessionStorage.setSession('awesomeRoomName', 'someSessionId');
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('POST requests', () => {
    const tokenRole = 'admin';
    it('returns a 200 when creating a room', async () => {
      const res = await request(server)
        .post(`/session/${roomName}`)
        .set('Content-Type', 'application/json')
        .send({ tokenRole });
      expect(res.statusCode).toEqual(200);
    });

    describe('archiving', () => {
      it('returns a 200 when starting an archive in a room', async () => {
        const res = await request(server)
          .post(`/session/${roomName}/startArchive`)
          .set('Content-Type', 'application/json')
          .send({ tokenRole });
        expect(res.statusCode).toEqual(200);
      });

      it('returns a 404 when starting an archive in a non-existent room', async () => {
        const invalidRoomName = 'nonExistingRoomName';
        const res = await request(server)
          .post(`/session/${invalidRoomName}/startArchive`)
          .set('Content-Type', 'application/json')
          .send({ tokenRole });
        expect(res.statusCode).toEqual(404);
      });

      it('returns a 500 when stopping an invalid archive in a room', async () => {
        const archiveId = 'b8-c9-d10';
        const res = await request(server)
          .post(`/session/${roomName}/${archiveId}/stopArchive`)
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .send({ tokenRole });
        expect(res.statusCode).toEqual(500);
      });
    });

    describe('captions', () => {
      const moderatorTokenRole = 'admin';
      const invalidRoomName = 'randomRoomName';
      const captionsId = '123e4567-a12b-41a2-a123-123456789012';

      describe('enabling captions', () => {
        it('returns a 200 when enabling captions in a room', async () => {
          const res = await request(server)
            .post(`/session/${roomName}/enableCaptions`)
            .set('Content-Type', 'application/json')
            .send({ tokenRole: moderatorTokenRole });
          expect(res.statusCode).toEqual(200);
        });

        it('returns a 404 when starting captions in a non-existent room', async () => {
          const res = await request(server)
            .post(`/session/${invalidRoomName}/enableCaptions`)
            .set('Content-Type', 'application/json')
            .send({ tokenRole: moderatorTokenRole });
          expect(res.statusCode).toEqual(404);
        });
      });

      describe('disabling captions', () => {
        it('returns a 200 when disabling captions in a room', async () => {
          const res = await request(server)
            .post(`/session/${roomName}/${captionsId}/disableCaptions`)
            .set('Content-Type', 'application/json')
            .send({ tokenRole: moderatorTokenRole });
          expect(res.statusCode).toEqual(200);
        });

        it('returns an invalid caption message when stopping an invalid captions in a room', async () => {
          const invalidCaptionId = 'wrongCaptionId';
          const res = await request(server)
            .post(`/session/${roomName}/${invalidCaptionId}/disableCaptions`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({ tokenRole: moderatorTokenRole });

          const responseBody = JSON.parse(res.text);
          expect(responseBody.message).toEqual('Invalid caption ID');
        });

        it('returns a 500 when stopping captions in a non-existent room', async () => {
          const res = await request(server)
            .post(`/session/${invalidRoomName}/${captionsId}/disableCaptions`)
            .set('Content-Type', 'application/json')
            .send({ tokenRole: moderatorTokenRole });
          expect(res.statusCode).toEqual(500);
        });

        it('returns a 400 when stopping captions with malformed captionsId', async () => {
          const invalidCaptionId = 'not-a-valid-captions-id';
          const res = await request(server)
            .post(`/session/${roomName}/${invalidCaptionId}/disableCaptions`)
            .set('Content-Type', 'application/json')
            .send({ tokenRole: moderatorTokenRole });
          expect(res.statusCode).toEqual(400);
        });
      });
    });
  });
});

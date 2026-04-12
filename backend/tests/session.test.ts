/* eslint-disable @typescript-eslint/await-thenable */
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import { Archive } from 'opentok';
import InMemorySessionStorage from '../storage/inMemorySessionStorage';
import mockOpentokConfig from '../helpers/__mocks__/config';

// base64('2~vonageAppId~0.0.0.0~2024-01-01') — valid format for decodeSessionId
const validSessionId = '1_Mn52b25hZ2VBcHBJZH4wLjAuMC4wfjIwMjQtMDEtMDE=';
const validSessionKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiIxX01YNWtNVEkxWWpGbU1DMWtZMkl5TFRRM05EY3RZamxrWVMxa09ESTVOMkk0WkdFME9UZC1makUzTnpVM09UWXhOVGd3TWpkLWFqaElOU3RYZEV4VU5sYzBZbE5vZGs5UVNYVllVRmRDZm41LSIsInJvb21OYW1lIjoiYXdlc29tZS1yb29tLW5hbWUiLCJpYXQiOjE3NzU5NjMzMjh9.QcNVXp6gatPTV82IJa8VgDG6rOLBkFjU3r7j_BcxM-c';

await jest.unstable_mockModule('../helpers/config', mockOpentokConfig);

// Mock third-party Vonage SDKs only
const actualAuth = await import('@vonage/auth');
const actualVideo = await import('@vonage/video');

await jest.unstable_mockModule('@vonage/auth', () => ({
  ...actualAuth,
  Auth: jest.fn().mockImplementation(() => ({ applicationId: 'vonageAppId' })),
}));

await jest.unstable_mockModule('@vonage/video', () => ({
  ...actualVideo,
  Video: jest.fn().mockImplementation(() => ({
    createSession: jest
      .fn<() => Promise<{ sessionId: string }>>()
      .mockResolvedValue({ sessionId: validSessionId }),
    generateClientToken: jest.fn().mockReturnValue('someToken'),
    startArchive: jest
      .fn<(sessionId: string) => Promise<{ id: string; status: string }>>()
      .mockResolvedValue({ id: 'archiveId', status: 'started' }),
    stopArchive: jest
      .fn<(archiveId: string) => Promise<{ id: string; status: string }>>()
      .mockImplementation((archiveId: string) => {
        if (archiveId === 'b8-c9-d10') {
          return Promise.reject(new Error('invalid archive'));
        }

        return Promise.resolve({ id: archiveId, status: 'stopped' });
      }),
    searchArchives: jest
      .fn<(filters: { sessionId: string }) => Promise<{ items: Archive[]; count: number }>>()
      .mockResolvedValue({
        items: [{ id: 'archive1' }, { id: 'archive2' }] as unknown as Archive[],
        count: 2,
      }),
    enableCaptions: jest
      .fn<() => Promise<{ captionsId: string }>>()
      .mockResolvedValue({ captionsId: '123e4567-a12b-41a2-a123-123456789012' }),
    disableCaptions: jest
      .fn<(captionsId: string) => Promise<void>>()
      .mockImplementation((captionsId: string) => {
        if (captionsId === 'wrongCaptionId') {
          return Promise.reject(new Error('Invalid caption ID'));
        }

        return Promise.resolve(undefined);
      }),
  })),
}));

await jest.unstable_mockModule('../videoService/opentokVideoService.ts', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        startArchive: jest.fn<() => Promise<string>>().mockResolvedValue('archiveId'),
        stopArchive: jest.fn<() => Promise<string>>().mockRejectedValue('invalid archive'),
        enableCaptions: jest.fn<() => Promise<string>>().mockResolvedValue('captionsId'),
        disableCaptions: jest.fn<() => Promise<string>>().mockResolvedValue('invalid caption'),
        generateToken: jest
          .fn<() => Promise<{ token: string; apiKey: string }>>()
          .mockResolvedValue({
            token: 'someToken',
            apiKey: 'someApiKey',
          }),
        createSession: jest.fn<() => Promise<string>>().mockResolvedValue(validSessionId),
        searchArchives: jest
          .fn<() => Promise<Archive[]>>()
          .mockResolvedValue([{ id: 'archive1' }, { id: 'archive2' }] as unknown as Archive[]),
      };
    }),
  };
});

const startServer = (await import('../server')).default;

describe.each([['InMemorySessionStorage', new InMemorySessionStorage()]])(
  '/session using %s',
  (_storageName, sessionStorage) => {
    let server: Server;
    const roomName = 'awesome-room-name';

    beforeAll(async () => {
      server = await startServer(0);
      await sessionStorage.setSession({
        roomName,
        sessionKey: validSessionKey,
      });
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
        await sessionStorage.setSession({
          roomName: 'awesome-room-name',
          sessionKey: validSessionKey,
        });
        const res = await request(server).get(`/session/${roomName}/archives`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.archives).toEqual([{ id: 'archive1' }, { id: 'archive2' }]);
      });
    });

    describe('POST requests', () => {
      describe('archiving', () => {
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

        it('returns a 502 when stopping an invalid archive in a room', async () => {
          const archiveId = 'b8-c9-d10';
          const res = await request(server)
            .post(`/session/${roomName}/${archiveId}/stopArchive`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
          expect(res.statusCode).toEqual(502);
        });
      });

      describe('captions', () => {
        it('returns a 200 when enabling captions in a room', async () => {
          const res = await request(server)
            .post(`/session/${roomName}/enableCaptions`)
            .set('Content-Type', 'application/json');
          expect(res.statusCode).toEqual(200);
        });

        it('returns a 200 when disabling captions in a room', async () => {
          const captionsId = '123e4567-a12b-41a2-a123-123456789012';
          const res = await request(server)
            .post(`/session/${roomName}/${captionsId}/disableCaptions`)
            .set('Content-Type', 'application/json');
          expect(res.statusCode).toEqual(200);
        });

        it('returns a 404 when starting captions in a non-existent room', async () => {
          const invalidRoomName = 'randomRoomName';
          const res = await request(server)
            .post(`/session/${invalidRoomName}/enableCaptions`)
            .set('Content-Type', 'application/json');
          expect(res.statusCode).toEqual(404);
        });

        it('returns a 502 when stopping an invalid caption in a room', async () => {
          const invalidCaptionId = 'wrongCaptionId';
          const res = await request(server)
            .post(`/session/${roomName}/${invalidCaptionId}/disableCaptions`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');

          expect(res.statusCode).toEqual(502);
        });

        it('returns a 404 when stopping captions in a non-existent room', async () => {
          const invalidRoomName = 'nonExistingRoomName';
          const captionsId = '123e4567-a12b-41a2-a123-123456789012';
          const res = await request(server)
            .post(`/session/${invalidRoomName}/${captionsId}/disableCaptions`)
            .set('Content-Type', 'application/json');
          expect(res.statusCode).toEqual(404);
        });

        it('returns a 404 when stopping captions with malformed captionsId in a non-existent room', async () => {
          const invalidRoomName = 'nonExistingRoomName';
          const captionsId = 'not-a-valid-captions-id';
          const res = await request(server)
            .post(`/session/${invalidRoomName}/${captionsId}/disableCaptions`)
            .set('Content-Type', 'application/json');
          expect(res.statusCode).toEqual(404);
        });
      });
    });
  }
);

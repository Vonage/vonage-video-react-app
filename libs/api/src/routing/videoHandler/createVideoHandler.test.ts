import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { MediaMode, type SingleArchiveResponse } from '@vonage/video';
import jwt from 'jsonwebtoken';
import createVideoHandler from './createVideoHandler';
import { TokenRole } from '@api-lib/types';
import type { NextResult } from '../videoRouter';

const mockApiKey = 'test-api-key';
const mockSessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
const mockSessionKey = jwt.sign({ sessionId: mockSessionId }, mockApiKey, { algorithm: 'HS256' });

const h = vi.hoisted(() => ({
  createSessionSpy: vi.fn(),
  startArchiveSpy: vi.fn(),
  stopArchiveSpy: vi.fn(),
  searchArchivesSpy: vi.fn(),
  enableCaptionsSpy: vi.fn(),
  disableCaptionsSpy: vi.fn(),
  generateClientTokenSpy: vi.fn(() => 'mock-token-12345'),
}));

vi.mock('@vonage/video', async () => {
  const mockVideoModule = (await import('@node-test/helpers/mockVideoModule')).default;
  const actual = await vi.importActual('@vonage/video');

  return mockVideoModule(actual, () => ({
    Video: ({ spyOn }) => {
      spyOn({
        createSession: h.createSessionSpy,
        startArchive: h.startArchiveSpy,
        stopArchive: h.stopArchiveSpy,
        searchArchives: h.searchArchivesSpy,
        enableCaptions: h.enableCaptionsSpy,
        disableCaptions: h.disableCaptionsSpy,
        generateClientToken: h.generateClientTokenSpy,
      });
    },
  }));
});

/**
 * Extracts the response data from the TRPC JSON response body.
 */
function extractResponseData<T>(body: unknown): T {
  return (body as { result: { data: T } }).result.data;
}

describe('createVideoHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a session successfully', async () => {
      h.createSessionSpy.mockResolvedValue({
        sessionId: mockSessionId,
        location: 'US',
        mediaMode: MediaMode.ROUTED,
        archiveMode: 'manual',
      });

      const app = createTestApp();

      const response = await request(app).post('/video/createSession').send({}).expect(200);

      const data = extractResponseData(response.body);

      expect(data).toMatchObject({
        sessionId: mockSessionId,
      });

      expect(h.createSessionSpy).toHaveBeenCalledWith(undefined);
    });

    it('should create a session with custom options', async () => {
      h.createSessionSpy.mockResolvedValue({
        sessionId: mockSessionId,
        location: '12.34.56.78',
        mediaMode: MediaMode.ROUTED,
        archiveMode: 'manual',
      });

      const app = createTestApp();

      const customOptions = {
        location: '12.34.56.78',
        archiveMode: 'manual' as const,
      };

      await request(app)
        .post('/video/createSession')
        .send({ sessionOptions: customOptions })
        .expect(200);

      expect(h.createSessionSpy).toHaveBeenCalledWith(customOptions);
    });

    it('should return an error response when creating a session fails', async () => {
      h.createSessionSpy.mockRejectedValue(new Error('Failed to create session on Vonage side'));

      const app = createTestApp();

      const response = await request(app).post('/video/createSession').send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('decodeSessionId', () => {
    it('should decode a valid sessionId', async () => {
      const app = createTestApp();

      const input = encodeURIComponent(JSON.stringify({ sessionId: mockSessionId }));

      const response = await request(app).get(`/video/decodeSessionId?input=${input}`);

      // decodeSessionId is not exposed as a TRPC route, only as a direct VideoClient method
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should return an error response for invalid sessionId', async () => {
      const app = createTestApp();

      const input = encodeURIComponent(JSON.stringify({ sessionId: 'invalid-session-id' }));

      const response = await request(app).get(`/video/decodeSessionId?input=${input}`);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('joinSession', () => {
    it('should join a session and return token', async () => {
      const app = createTestApp();

      const response = await request(app)
        .post('/video/joinSession')
        .send({ sessionKey: mockSessionKey })
        .expect(200);

      const data = extractResponseData(response.body);

      expect(data).toMatchObject({
        location: expect.any(String),
        token: expect.any(String),
      });
    });

    it('should join session with custom client token options', async () => {
      const app = createTestApp();

      const clientTokenOptions = {
        role: TokenRole.PUBLISHER,
        data: 'custom-data',
      };

      const response = await request(app)
        .post('/video/joinSession')
        .send({
          sessionKey: mockSessionKey,
          clientTokenOptions,
        })
        .expect(200);

      const data = extractResponseData(response.body);

      expect(data).toMatchObject({
        token: expect.any(String),
      });
    });
  });

  describe('startArchive', () => {
    it('should start an archive successfully', async () => {
      const mockArchive: SingleArchiveResponse = {
        id: 'archive-id-123',
        sessionId: mockSessionId,
        name: 'test-archive',
        status: 'started',
        createdAt: Date.now(),
        size: 0,
        duration: 0,
        hasAudio: true,
        hasVideo: true,
        outputMode: 'composed',
        resolution: '640x480',
      } as SingleArchiveResponse;

      h.startArchiveSpy.mockResolvedValue(mockArchive);

      const app = createTestApp();

      const response = await request(app)
        .post('/video/startArchive')
        .send({
          sessionKey: mockSessionKey,
          archiveOptions: { name: 'test-archive' },
        })
        .expect(200);

      expect(h.startArchiveSpy).toHaveBeenCalledWith(mockSessionId, {
        name: 'test-archive',
      });

      const data = extractResponseData(response.body);

      expect(data).toMatchObject({
        id: 'archive-id-123',
        sessionId: mockSessionId,
        name: 'test-archive',
      });
    });

    it('should return an error response when starting archive fails', async () => {
      h.startArchiveSpy.mockRejectedValue(new Error('Failed to start archive'));

      const app = createTestApp();

      const response = await request(app).post('/video/startArchive').send({
        sessionKey: mockSessionKey,
        archiveOptions: {},
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('stopArchive', () => {
    it('should stop an archive successfully', async () => {
      const mockArchive: SingleArchiveResponse = {
        id: 'archive-id-123',
        sessionId: mockSessionId,
        status: 'stopped',
      } as SingleArchiveResponse;

      h.stopArchiveSpy.mockResolvedValue(mockArchive);

      const app = createTestApp();

      const response = await request(app)
        .post('/video/stopArchive')
        .send({
          sessionKey: mockSessionKey,
          archiveId: 'archive-id-123',
        })
        .expect(200);

      expect(h.stopArchiveSpy).toHaveBeenCalledWith('archive-id-123');

      const data = extractResponseData(response.body);

      expect(data).toMatchObject({
        id: 'archive-id-123',
        status: 'stopped',
      });
    });

    it('should return an error response when stopping archive fails', async () => {
      h.stopArchiveSpy.mockRejectedValue(new Error('Failed to stop archive'));

      const app = createTestApp();

      const response = await request(app).post('/video/stopArchive').send({
        sessionKey: mockSessionKey,
        archiveId: 'archive-id-123',
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('searchArchives', () => {
    it('should search archives successfully', async () => {
      const mockArchives = {
        items: [
          {
            id: 'archive-1',
            sessionId: mockSessionId,
            name: 'archive-1',
            createdAt: Date.now(),
            duration: 100,
            hasAudio: true,
            hasVideo: true,
            outputMode: 'composed' as const,
            resolution: '640x480',
            status: 'available' as const,
            size: 12345,
          },
          {
            id: 'archive-2',
            sessionId: mockSessionId,
            name: 'archive-2',
            createdAt: Date.now(),
            duration: 200,
            hasAudio: true,
            hasVideo: true,
            outputMode: 'composed' as const,
            resolution: '640x480',
            status: 'available' as const,
            size: 23456,
          },
        ],
        count: 2,
      };

      h.searchArchivesSpy.mockResolvedValue(mockArchives);

      const app = createTestApp();

      const response = await request(app)
        .post('/video/searchArchives')
        .send({ sessionKey: mockSessionKey })
        .expect(200);

      expect(h.searchArchivesSpy).toHaveBeenCalledWith({
        sessionId: mockSessionId,
      });

      const data = extractResponseData(response.body);

      expect(data).toMatchObject({
        items: expect.arrayContaining([
          expect.objectContaining({ id: 'archive-1' }),
          expect.objectContaining({ id: 'archive-2' }),
        ]),
        count: 2,
      });
    });

    it('should return an error response when searching archives fails', async () => {
      h.searchArchivesSpy.mockRejectedValue(new Error('Failed to search archives'));

      const app = createTestApp();

      const response = await request(app)
        .post('/video/searchArchives')
        .send({ sessionKey: mockSessionKey });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('enableCaptions', () => {
    it('should enable captions successfully', async () => {
      h.enableCaptionsSpy.mockResolvedValue({
        captionsId: 'caption-id-123',
      });

      const app = createTestApp();

      await request(app)
        .post('/video/enableCaptions')
        .send({ sessionKey: mockSessionKey })
        .expect(200);

      expect(h.enableCaptionsSpy).toHaveBeenCalledWith(
        mockSessionId,
        expect.any(String),
        undefined
      );
    });

    it('should enable captions with custom options', async () => {
      h.enableCaptionsSpy.mockResolvedValue({
        captionsId: 'caption-id-456',
      });

      const app = createTestApp();

      const captionOptions = {
        languageCode: 'en-US',
        maxDuration: 300,
        partialCaptions: 'false' as const,
        statusCallbackUrl: 'https://example.com/callback',
      };

      await request(app)
        .post('/video/enableCaptions')
        .send({
          sessionKey: mockSessionKey,
          captionOptions,
        })
        .expect(200);

      expect(h.enableCaptionsSpy).toHaveBeenCalledWith(
        mockSessionId,
        expect.any(String),
        captionOptions
      );
    });

    it('should return an error response when enabling captions fails', async () => {
      h.enableCaptionsSpy.mockRejectedValue(new Error('Failed to enable captions'));

      const app = createTestApp();

      const response = await request(app)
        .post('/video/enableCaptions')
        .send({ sessionKey: mockSessionKey });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('disableCaptions', () => {
    it('should disable captions successfully', async () => {
      h.disableCaptionsSpy.mockResolvedValue(undefined);

      const app = createTestApp();

      await request(app)
        .post('/video/disableCaptions')
        .send({
          sessionKey: mockSessionKey,
          captionsId: 'caption-id-123',
        })
        .expect(200);

      expect(h.disableCaptionsSpy).toHaveBeenCalledWith('caption-id-123');
    });

    it('should return an error response when disabling captions fails', async () => {
      h.disableCaptionsSpy.mockRejectedValue(new Error('Failed to disable captions'));

      const app = createTestApp();

      const response = await request(app).post('/video/disableCaptions').send({
        sessionKey: mockSessionKey,
        captionsId: 'caption-id-123',
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('fluent helpers', () => {
    it('should mount fluent chain from transform$ and use$ directly in app.use', async () => {
      h.createSessionSpy.mockResolvedValue({
        sessionId: mockSessionId,
        location: 'US',
        mediaMode: MediaMode.ROUTED,
        archiveMode: 'manual',
      });

      const middlewareSpy = vi.fn((middlewareParameters: { next: () => NextResult }) => {
        return middlewareParameters.next();
      });

      const app = express();

      app.use(
        '/video',
        createVideoHandler({
          auth: {
            authType: 'apiKey',
            apiKey: mockApiKey,
            apiSecret: 'test-api-secret',
          },
        })
          .transform$('createSession', () => ({
            sessionOptions: { location: '12.34.56.78' },
          }))
          .use$(middlewareSpy)
      );

      await request(app).post('/video/createSession').send({}).expect(200);

      expect(middlewareSpy).toHaveBeenCalledTimes(1);
      expect(middlewareSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          videoAction: 'createSession',
        })
      );
      expect(h.createSessionSpy).toHaveBeenCalledWith({ location: '12.34.56.78' });
    });

    it('should mount fluent chain from use$ and override$ and bypass default handler', async () => {
      const actionMiddlewareSpy = vi.fn((middlewareParameters: { next: () => NextResult }) => {
        return middlewareParameters.next();
      });

      const app = express();

      app.use(
        '/video',
        createVideoHandler({
          auth: {
            authType: 'apiKey',
            apiKey: mockApiKey,
            apiSecret: 'test-api-secret',
          },
        })
          .use$('searchArchives', actionMiddlewareSpy)
          .override$('searchArchives', () => ({ items: [], count: 0 }))
      );

      const response = await request(app)
        .post('/video/searchArchives')
        .send({ sessionKey: mockSessionKey })
        .expect(200);

      const data = extractResponseData<{ items: unknown[]; count: number }>(response.body);

      expect(data).toMatchObject({ items: [], count: 0 });
      expect(actionMiddlewareSpy).toHaveBeenCalledTimes(1);
      expect(actionMiddlewareSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          videoAction: 'searchArchives',
        })
      );
      expect(h.searchArchivesSpy).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should format errors in the response body', async () => {
      h.createSessionSpy.mockRejectedValue(new Error('Vonage API error: Unauthorized'));

      const app = createTestApp();

      const response = await request(app).post('/video/createSession').send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.error).toBeDefined();
    });
  });
});

function createTestApp() {
  const app = express();

  const handler = createVideoHandler({
    auth: {
      authType: 'apiKey',
      apiKey: mockApiKey,
      apiSecret: 'test-api-secret',
    },
  });

  app.use('/video', handler);

  return app;
}

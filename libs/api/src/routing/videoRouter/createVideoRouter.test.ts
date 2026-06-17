import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { MediaMode, type SingleArchiveResponse, ArchiveMode } from '@vonage/video';
import jwt from 'jsonwebtoken';
import createVideoHandler from '../videoHandler/createVideoHandler';
import { TokenRole } from '@api-lib/types';

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

beforeEach(() => {
  h.createSessionSpy.mockReset();
  h.startArchiveSpy.mockReset();
  h.stopArchiveSpy.mockReset();
  h.searchArchivesSpy.mockReset();
  h.enableCaptionsSpy.mockReset();
  h.disableCaptionsSpy.mockReset();
  h.generateClientTokenSpy.mockReset();
  h.generateClientTokenSpy.mockReturnValue('mock-token-12345');
});

describe('createVideoHandler', () => {
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

    it('should create a session and join it successfully', async () => {
      h.createSessionSpy.mockResolvedValue({
        sessionId: mockSessionId,
        location: 'US',
        mediaMode: MediaMode.ROUTED,
        archiveMode: 'manual',
      });

      const app = createTestApp();

      await request(app).post('/video/createSession').send({}).expect(200);

      const joinResponse = await request(app)
        .post('/video/joinSession')
        .send({ sessionKey: mockSessionKey })
        .expect(200);

      const joinData = extractResponseData(joinResponse.body);

      expect(joinData).toMatchObject({
        location: expect.any(String),
        token: expect.any(String),
      });
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
    it('should decode a valid sessionId via VideoClient method (not a TRPC route)', async () => {
      const app = createTestApp();

      const input = encodeURIComponent(JSON.stringify({ sessionId: mockSessionId }));

      // decodeSessionId is not exposed as a TRPC route
      const response = await request(app).get(`/video/decodeSessionId?input=${input}`);
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

  describe('ensureCaptionsEnabled', () => {
    it('should ensure captions are enabled, treat idempotent failures as success, and fail when session does not exist', async () => {
      expect.assertions(6);

      const app = createTestApp();
      const requestEnsureCaptionsEnabled = () => {
        return request(app)
          .post('/video/ensureCaptionsEnabled')
          .send({ sessionKey: mockSessionKey });
      };

      h.enableCaptionsSpy
        .mockResolvedValueOnce({ captionsId: 'caption-id-789' })
        .mockRejectedValueOnce(new Error('Live captions have already started for this session'))
        .mockRejectedValueOnce(new Error('Session does not exist'));

      const successfulResponse = await requestEnsureCaptionsEnabled().expect(200);
      const alreadyStartedResponse = await requestEnsureCaptionsEnabled().expect(200);
      const missingSessionResponse = await requestEnsureCaptionsEnabled();

      expect(missingSessionResponse.status).toBeGreaterThanOrEqual(400);
      expect(missingSessionResponse.body.error).toBeDefined();
      expect(h.enableCaptionsSpy).toHaveBeenCalledTimes(3);
      expect(h.enableCaptionsSpy).toHaveBeenCalledWith(
        mockSessionId,
        expect.any(String),
        undefined
      );

      const successfulData = extractResponseData<{ captionsId: string | null }>(
        successfulResponse.body
      );

      const alreadyStartedData = extractResponseData<{ captionsId: string | null }>(
        alreadyStartedResponse.body
      );

      expect(successfulData).toMatchObject({ captionsId: 'caption-id-789' });
      expect(alreadyStartedData).toMatchObject({ captionsId: null });
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

  describe('error handling', () => {
    it('should format errors in the response body', async () => {
      h.createSessionSpy.mockRejectedValue(new Error('Vonage API error: Unauthorized'));

      const app = createTestApp();

      const response = await request(app).post('/video/createSession').send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('onSettled$', () => {
    it('should execute global onSettled after createSession success', async () => {
      h.createSessionSpy.mockResolvedValue({
        sessionId: mockSessionId,
        location: 'US',
        mediaMode: MediaMode.ROUTED,
        archiveMode: 'manual',
      });

      const onSettledSpy = vi.fn();
      const app = createTestApp((videoHandler) => {
        videoHandler.onSettled$(onSettledSpy);
      });

      await request(app).post('/video/createSession').send({}).expect(200);

      expect(onSettledSpy).toHaveBeenCalledTimes(1);
      expect(onSettledSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          videoAction: 'createSession',
          error: null,
          result: expect.objectContaining({ sessionId: mockSessionId }),
        })
      );
    });

    it('should execute action onSettled when createSession fails', async () => {
      h.createSessionSpy.mockRejectedValue(new Error('Failed to create session in onSettled test'));

      const onSettledSpy = vi.fn();
      const app = createTestApp((videoHandler) => {
        videoHandler.onSettled$('createSession', onSettledSpy);
      });

      const response = await request(app).post('/video/createSession').send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(onSettledSpy).toHaveBeenCalledTimes(1);
      expect(onSettledSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          videoAction: 'createSession',
          result: null,
          error: expect.any(Error),
        })
      );

      const settledCall = onSettledSpy.mock.calls[0]?.[0] as { error: Error };
      expect(settledCall.error.message).toContain('Failed to create session');
    });
  });

  describe('use$', () => {
    it('should allow middleware to transform createSession input', async () => {
      h.createSessionSpy.mockResolvedValue({
        sessionId: mockSessionId,
        location: 'US',
        mediaMode: MediaMode.ROUTED,
        archiveMode: 'manual',
      });

      const app = createTestApp((videoHandler) => {
        videoHandler.use$('createSession', ({ input, next }) => {
          const baseInput = (input ?? {}) as Record<string, unknown>;

          return next({
            input: {
              ...baseInput,
              sessionOptions: {
                location: '12.34.56.78',
                archiveMode: ArchiveMode.MANUAL,
              },
            },
          });
        });
      });

      await request(app).post('/video/createSession').send({}).expect(200);

      expect(h.createSessionSpy).toHaveBeenCalledWith({
        location: '12.34.56.78',
        archiveMode: 'manual',
      });
    });

    it('should fail when middleware does not return next()', async () => {
      h.createSessionSpy.mockResolvedValue({
        sessionId: mockSessionId,
        location: 'US',
        mediaMode: MediaMode.ROUTED,
        archiveMode: 'manual',
      });

      const app = createTestApp((videoHandler) => {
        videoHandler.use$('createSession', () => {
          return {} as never;
        });
      });

      const response = await request(app).post('/video/createSession').send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('TRPC client compatibility', () => {
    it('should accept mutations with TRPC json-wrapped body', async () => {
      const app = createTestApp();

      const response = await request(app)
        .post('/video/joinSession')
        .send({ json: { sessionKey: mockSessionKey } })
        .expect(200);

      const data = extractResponseData(response.body);

      expect(data).toMatchObject({
        location: expect.any(String),
        token: expect.any(String),
      });
    });

    it('should accept mutations with raw body', async () => {
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

    it('should accept mutations with TRPC json-wrapped body for searchArchives', async () => {
      h.searchArchivesSpy.mockResolvedValue({ items: [], count: 0 });

      const app = createTestApp();

      const response = await request(app)
        .post('/video/searchArchives')
        .send({ json: { sessionKey: mockSessionKey } })
        .expect(200);

      const data = extractResponseData(response.body);

      expect(data).toMatchObject({
        items: expect.any(Array),
        count: 0,
      });
    });

    it('should accept mutations with raw body for searchArchives', async () => {
      h.searchArchivesSpy.mockResolvedValue({ items: [], count: 0 });

      const app = createTestApp();

      const response = await request(app)
        .post('/video/searchArchives')
        .send({ sessionKey: mockSessionKey })
        .expect(200);

      const data = extractResponseData(response.body);

      expect(data).toMatchObject({
        items: expect.any(Array),
        count: 0,
      });
    });
  });
});

function createTestApp(
  setupHandler?: (videoHandler: ReturnType<typeof createVideoHandler>) => void
) {
  const app = express();

  const handler = createVideoHandler({
    auth: {
      authType: 'apiKey',
      apiKey: mockApiKey,
      apiSecret: 'test-api-secret',
    },
  });

  if (setupHandler) {
    setupHandler(handler);
  }

  app.use('/video', handler);

  return app;
}

/**
 * Extracts the response data from the TRPC JSON response body.
 */
function extractResponseData<T>(body: unknown): T {
  return (body as { result: { data: T } }).result.data;
}

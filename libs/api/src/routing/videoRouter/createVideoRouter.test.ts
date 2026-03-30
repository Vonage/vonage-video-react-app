import { describe, it, expect, vi } from 'vitest';
import { MediaMode, type SingleArchiveResponse } from '@vonage/video';
import createVideoRouter from './createVideoRouter';
import { videoRouterContext } from '@api-lib/constants';
import { TokenRole } from '@api-lib/types';

const mockSessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';

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

describe('createVideoRouter', () => {
  // Helper to create procedure call options with required fields
  const createCallOpts = <T>(input: T, type: 'mutation' | 'query' = 'mutation') => ({
    ctx: {
      [videoRouterContext]: undefined,
    },
    type,
    path: '',
    input,
    getRawInput: () => Promise.resolve(input),
    signal: new AbortController().signal,
    batchIndex: 0,
  });

  describe('createSession', () => {
    it('should create a session successfully', async () => {
      h.createSessionSpy.mockResolvedValue({
        sessionId: mockSessionId,
        location: 'US',
        mediaMode: MediaMode.ROUTED,
        archiveMode: 'manual',
      });

      const router = createTestRouter();

      const result = await router.createSession(createCallOpts({}));

      expect(h.createSessionSpy).toHaveBeenCalledWith({
        mediaMode: MediaMode.ROUTED,
      });

      expect(result).toMatchObject({
        sessionId: mockSessionId,
        location: expect.any(String),
        p2p: expect.any(Boolean),
      });
    });

    it('should create a session with custom options', async () => {
      h.createSessionSpy.mockResolvedValue({
        sessionId: mockSessionId,
        location: '12.34.56.78',
        mediaMode: MediaMode.ROUTED,
        archiveMode: 'manual',
      });

      const router = createTestRouter();

      const customOptions = {
        location: '12.34.56.78',
        archiveMode: 'manual' as const,
      };

      await router.createSession(createCallOpts({ sessionOptions: customOptions }));

      expect(h.createSessionSpy).toHaveBeenCalledWith({
        mediaMode: MediaMode.ROUTED,
        ...customOptions,
      });
    });

    it('should handle errors when creating a session', async () => {
      h.createSessionSpy.mockRejectedValue(new Error('Failed to create session on Vonage side'));

      const router = createTestRouter();

      await expect(router.createSession(createCallOpts({}))).rejects.toThrow();
    });
  });

  describe('decodeSessionId', () => {
    it('should decode a valid sessionId', async () => {
      const router = createTestRouter();

      const result = await router.decodeSessionId(
        createCallOpts({ sessionId: mockSessionId }, 'query')
      );

      expect(result).toMatchObject({
        location: expect.any(String),
        p2p: expect.any(Boolean),
      });
    });

    it('should handle invalid sessionId', async () => {
      const router = createTestRouter();

      await expect(
        router.decodeSessionId(createCallOpts({ sessionId: 'invalid-session-id' }, 'query'))
      ).rejects.toThrow();
    });
  });

  describe('joinSession', () => {
    it('should join a session and return token', async () => {
      const router = createTestRouter();

      const result = await router.joinSession(createCallOpts({ sessionId: mockSessionId }));

      expect(result).toMatchObject({
        location: expect.any(String),
        token: expect.any(String),
      });
    });

    it('should join session with custom client token options', async () => {
      const router = createTestRouter();

      const clientTokenOptions = {
        role: TokenRole.PUBLISHER,
        data: 'custom-data',
      };

      const result = await router.joinSession(
        createCallOpts({
          sessionId: mockSessionId,
          clientTokenOptions,
        })
      );

      expect(result).toMatchObject({
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

      const router = createTestRouter();

      const result = await router.startArchive(
        createCallOpts({
          sessionId: mockSessionId,
          archiveOptions: { name: 'test-archive' },
        })
      );

      expect(h.startArchiveSpy).toHaveBeenCalledWith(mockSessionId, {
        name: 'test-archive',
      });

      expect(result).toMatchObject({
        id: 'archive-id-123',
        sessionId: mockSessionId,
        name: 'test-archive',
      });
    });

    it('should handle errors when starting archive', async () => {
      h.startArchiveSpy.mockRejectedValue(new Error('Failed to start archive'));

      const router = createTestRouter();

      await expect(
        router.startArchive(
          createCallOpts({
            sessionId: mockSessionId,
            archiveOptions: {},
          })
        )
      ).rejects.toThrow();
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

      const router = createTestRouter();

      const result = await router.stopArchive(
        createCallOpts({ sessionId: mockSessionId, archiveId: 'archive-id-123' })
      );

      expect(h.stopArchiveSpy).toHaveBeenCalledWith('archive-id-123');

      expect(result).toMatchObject({
        id: 'archive-id-123',
        status: 'stopped',
      });
    });

    it('should handle errors when stopping archive', async () => {
      h.stopArchiveSpy.mockRejectedValue(new Error('Failed to stop archive'));

      const router = createTestRouter();

      await expect(
        router.stopArchive(
          createCallOpts({ sessionId: mockSessionId, archiveId: 'archive-id-123' })
        )
      ).rejects.toThrow();
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

      const router = createTestRouter();

      const result = await router.searchArchives(
        createCallOpts({ sessionId: mockSessionId }, 'query')
      );

      expect(h.searchArchivesSpy).toHaveBeenCalledWith({
        sessionId: mockSessionId,
      });

      expect(result).toMatchObject({
        items: expect.arrayContaining([
          expect.objectContaining({ id: 'archive-1' }),
          expect.objectContaining({ id: 'archive-2' }),
        ]),
        count: 2,
      });
    });

    it('should handle errors when searching archives', async () => {
      h.searchArchivesSpy.mockRejectedValue(new Error('Failed to search archives'));

      const router = createTestRouter();

      await expect(
        router.searchArchives(createCallOpts({ sessionId: mockSessionId }, 'query'))
      ).rejects.toThrow();
    });
  });

  describe('enableCaptions', () => {
    it('should enable captions successfully', async () => {
      h.enableCaptionsSpy.mockResolvedValue({
        captionsId: 'caption-id-123',
      });

      const router = createTestRouter();

      await router.enableCaptions(createCallOpts({ sessionId: mockSessionId }));

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

      const router = createTestRouter();

      const captionOptions = {
        languageCode: 'en-US',
        maxDuration: 300,
        partialCaptions: 'false' as const,
        statusCallbackUrl: 'https://example.com/callback',
      };

      await router.enableCaptions(
        createCallOpts({
          sessionId: mockSessionId,
          captionOptions,
        })
      );

      expect(h.enableCaptionsSpy).toHaveBeenCalledWith(
        mockSessionId,
        expect.any(String),
        captionOptions
      );
    });

    it('should handle errors when enabling captions', async () => {
      h.enableCaptionsSpy.mockRejectedValue(new Error('Failed to enable captions'));

      const router = createTestRouter();

      await expect(
        router.enableCaptions(createCallOpts({ sessionId: mockSessionId }))
      ).rejects.toThrow();
    });
  });

  describe('disableCaptions', () => {
    it('should disable captions successfully', async () => {
      h.disableCaptionsSpy.mockResolvedValue(undefined);

      const router = createTestRouter();

      await router.disableCaptions(
        createCallOpts({ sessionId: mockSessionId, captionsId: 'caption-id-123' })
      );

      expect(h.disableCaptionsSpy).toHaveBeenCalledWith('caption-id-123');
    });

    it('should handle errors when disabling captions', async () => {
      h.disableCaptionsSpy.mockRejectedValue(new Error('Failed to disable captions'));

      const router = createTestRouter();

      await expect(
        router.disableCaptions(
          createCallOpts({ sessionId: mockSessionId, captionsId: 'caption-id-123' })
        )
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should format errors correctly', async () => {
      h.createSessionSpy.mockRejectedValue(new Error('Vonage API error: Unauthorized'));

      const router = createTestRouter();

      try {
        await router.createSession(createCallOpts({}));

        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

function createTestRouter() {
  const mockApiKey = 'test-api-key';
  const mockApiSecret = 'test-api-secret';

  return createVideoRouter({
    auth: {
      authType: 'apiKey',
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
    },
  });
}

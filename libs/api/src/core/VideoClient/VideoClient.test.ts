import { describe, it, expect, vi, type Mock } from 'vitest';
import { Video, MediaMode, type SingleArchiveResponse, ArchiveMode } from '@vonage/video';
import { Auth } from '@vonage/auth';
import { createVideoClient } from '.';
import { TokenRole } from '@api-lib/types';

vi.mock('@vonage/video');
vi.mock('@vonage/auth');

describe('VideoClient', () => {
  const mockApiKey = 'test-api-key';
  const mockApiSecret = 'test-api-secret';
  const mockSessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';

  describe('constructor', () => {
    it('should create orchestrator with auth config', () => {
      const orchestrator = createTestOrchestrator();

      expect(orchestrator).toBeDefined();
      expect(Auth).toHaveBeenCalledWith({
        authType: 'apiKey',
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
      });
    });

    it('should create orchestrator with video params', () => {
      vi.clearAllMocks();

      const videoParams = { timeout: 5000 };

      createTestOrchestrator({ videoParams });

      // VideoClient creates Auth instance from config, so Video receives Auth instance
      expect(Video).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: mockApiKey }),
        videoParams
      );
    });
  });

  describe('createSession', () => {
    it('should create a session with default options', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.createSession.mockResolvedValue({
        sessionId: mockSessionId,
      });

      const result = await orchestrator.createSession();

      expect(mocks.video.createSession).toHaveBeenCalledWith({
        mediaMode: MediaMode.ROUTED,
      });

      // Result includes decoded session info (from decodeSessionId) + sessionId
      expect(result).toMatchObject({
        sessionId: mockSessionId,
        location: expect.any(String),
        p2p: expect.any(Boolean),
      });
    });

    it('should create a session with custom options', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.createSession.mockResolvedValue({
        sessionId: mockSessionId,
      });

      const sessionOptions = {
        location: '12.34.56.78',
        archiveMode: ArchiveMode.ALWAYS,
      };

      const result = await orchestrator.createSession({ sessionOptions });

      expect(mocks.video.createSession).toHaveBeenCalledWith({
        mediaMode: MediaMode.ROUTED,
        ...sessionOptions,
      });

      expect(result.sessionId).toBe(mockSessionId);
    });

    it('should handle errors from Vonage API', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.createSession.mockRejectedValue(new Error('Vonage API error'));

      await expect(orchestrator.createSession()).rejects.toThrow('Failed to create session');
    });
  });

  describe('decodeSessionId', () => {
    it('should decode a valid sessionId', () => {
      const { orchestrator } = createTestOrchestrator();

      const result = orchestrator.decodeSessionId({ sessionId: mockSessionId });

      expect(result).toMatchObject({
        location: expect.any(String),
        p2p: expect.any(Boolean),
        autoArchive: expect.any(Boolean),
        version: expect.any(String),
        partnerId: expect.any(String),
      });
    });

    it('should handle invalid sessionId format', () => {
      const { orchestrator } = createTestOrchestrator();

      expect(() => {
        orchestrator.decodeSessionId({ sessionId: 'invalid-session-id' });
      }).toThrow();
    });

    it('should handle empty sessionId', () => {
      const { orchestrator } = createTestOrchestrator();

      expect(() => {
        orchestrator.decodeSessionId({ sessionId: '' });
      }).toThrow();
    });
  });

  describe('createEphemeralToken', () => {
    it('should create token with default options', () => {
      const { orchestrator } = createTestOrchestrator();

      const result = orchestrator.createEphemeralToken({ sessionId: mockSessionId });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should create token with custom role', () => {
      const { orchestrator } = createTestOrchestrator();

      const result = orchestrator.createEphemeralToken({
        sessionId: mockSessionId,
        clientTokenOptions: {
          role: TokenRole.PUBLISHER,
        },
      });

      expect(result).toBeDefined();
    });

    it('should create token with custom expiration', () => {
      const { orchestrator } = createTestOrchestrator();

      const customExpireTime = Date.now() + 3600000;

      const result = orchestrator.createEphemeralToken({
        sessionId: mockSessionId,
        clientTokenOptions: {
          expireTime: customExpireTime,
        },
      });

      expect(result).toBeDefined();
    });

    it('should create token with custom data', () => {
      const { orchestrator } = createTestOrchestrator();

      const result = orchestrator.createEphemeralToken({
        sessionId: mockSessionId,
        clientTokenOptions: {
          data: 'custom-user-data',
        },
      });

      expect(result).toBeDefined();
    });

    it('should create token with initial layout class list', () => {
      const { orchestrator } = createTestOrchestrator();

      const result = orchestrator.createEphemeralToken({
        sessionId: mockSessionId,
        clientTokenOptions: {
          initialLayoutClassList: ['focus', 'presenter'],
        },
      });

      expect(result).toBeDefined();
    });
  });

  describe('joinSession', () => {
    it('should join session and return token', () => {
      const { orchestrator } = createTestOrchestrator();

      const result = orchestrator.joinSession({ sessionId: mockSessionId });

      expect(result).toMatchObject({
        location: expect.any(String),
        p2p: expect.any(Boolean),
        token: expect.any(String),
      });
    });

    it('should join session with custom token options', () => {
      const { orchestrator } = createTestOrchestrator();

      const result = orchestrator.joinSession({
        sessionId: mockSessionId,
        clientTokenOptions: {
          role: TokenRole.SUBSCRIBER,
          data: 'viewer-data',
        },
      });

      expect(result).toMatchObject({
        token: expect.any(String),
      });
    });

    it('should handle invalid sessionId when joining', () => {
      const { orchestrator } = createTestOrchestrator();

      expect(() => {
        orchestrator.joinSession({ sessionId: 'invalid' });
      }).toThrow();
    });
  });

  describe('startArchive', () => {
    it('should start archive successfully', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      const mockArchive: SingleArchiveResponse = {
        id: 'archive-123',
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

      mocks.video.startArchive.mockResolvedValue(mockArchive);

      const result = await orchestrator.startArchive({
        sessionId: mockSessionId,
        archiveOptions: {},
      });

      expect(mocks.video.startArchive).toHaveBeenCalledWith(mockSessionId, {});
      expect(result).toMatchObject(mockArchive);
    });

    it('should start archive with options', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      const mockArchive: SingleArchiveResponse = {
        id: 'archive-123',
        sessionId: mockSessionId,
        name: 'custom-archive',
        status: 'started',
      } as SingleArchiveResponse;

      mocks.video.startArchive.mockResolvedValue(mockArchive);

      const archiveOptions = {
        name: 'custom-archive',
        hasAudio: true,
        hasVideo: true,
      };

      await orchestrator.startArchive({
        sessionId: mockSessionId,
        archiveOptions,
      });

      expect(mocks.video.startArchive).toHaveBeenCalledWith(mockSessionId, archiveOptions);
    });

    it('should handle errors when starting archive', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.startArchive.mockRejectedValue(new Error('Archive error'));

      await expect(
        orchestrator.startArchive({
          archiveOptions: {},
          sessionId: mockSessionId,
        })
      ).rejects.toThrow();
    });
  });

  describe('stopArchive', () => {
    it('should stop archive successfully', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      const mockArchive: SingleArchiveResponse = {
        id: 'archive-123',
        status: 'stopped',
      } as SingleArchiveResponse;

      mocks.video.stopArchive.mockResolvedValue(mockArchive);

      const result = await orchestrator.stopArchive({
        sessionId: mockSessionId,
        archiveId: 'archive-123',
      });

      expect(mocks.video.stopArchive).toHaveBeenCalledWith('archive-123');
      expect(result).toMatchObject(mockArchive);
    });

    it('should handle errors when stopping archive', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.stopArchive.mockRejectedValue(new Error('Stop error'));

      await expect(
        orchestrator.stopArchive({
          sessionId: mockSessionId,
          archiveId: 'archive-123',
        })
      ).rejects.toThrow();
    });
  });

  describe('searchArchives', () => {
    it('should search archives successfully', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      const mockArchives = {
        items: [
          { id: 'archive-1', sessionId: mockSessionId },
          { id: 'archive-2', sessionId: mockSessionId },
        ],
        count: 2,
      };

      mocks.video.searchArchives.mockResolvedValue(mockArchives);

      const result = await orchestrator.searchArchives({
        sessionId: mockSessionId,
      });

      expect(mocks.video.searchArchives).toHaveBeenCalledWith({
        sessionId: mockSessionId,
      });

      expect(result).toMatchObject(mockArchives);
    });

    it('should search archives with filters', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      const mockArchives = { items: [], count: 0 };

      mocks.video.searchArchives.mockResolvedValue(mockArchives);

      const filters = {
        sessionId: mockSessionId,
        offset: 10,
        count: 20,
      };

      await orchestrator.searchArchives(filters);

      expect(mocks.video.searchArchives).toHaveBeenCalledWith(filters);
    });

    it('should handle errors when searching archives', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.searchArchives.mockRejectedValue(new Error('Search error'));

      await expect(
        orchestrator.searchArchives({
          sessionId: mockSessionId,
        })
      ).rejects.toThrow();
    });
  });

  describe('enableCaptions', () => {
    it('should enable captions successfully', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.enableCaptions.mockResolvedValue(undefined);

      await orchestrator.enableCaptions({
        sessionId: mockSessionId,
      });

      expect(mocks.video.enableCaptions).toHaveBeenCalledWith(
        mockSessionId,
        expect.any(String),
        undefined
      );
    });

    it('should enable captions with options', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.enableCaptions.mockResolvedValue(undefined);

      const captionOptions = {
        languageCode: 'en-US',
        maxDuration: 300,
        partialCaptions: 'false' as const,
        statusCallbackUrl: 'https://example.com/callback',
      };

      await orchestrator.enableCaptions({
        sessionId: mockSessionId,
        captionOptions,
      });

      expect(mocks.video.enableCaptions).toHaveBeenCalledWith(
        mockSessionId,
        expect.any(String),
        captionOptions
      );
    });

    it('should handle errors when enabling captions', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.enableCaptions.mockRejectedValue(new Error('Captions error'));

      await expect(
        orchestrator.enableCaptions({
          sessionId: mockSessionId,
        })
      ).rejects.toThrow();
    });
  });

  describe('disableCaptions', () => {
    it('should disable captions successfully', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.disableCaptions.mockResolvedValue(undefined);

      await orchestrator.disableCaptions({
        sessionId: mockSessionId,
        captionsId: 'caption-123',
      });

      expect(mocks.video.disableCaptions).toHaveBeenCalledWith('caption-123');
    });

    it('should handle errors when disabling captions', async () => {
      const { orchestrator, mocks } = createTestOrchestrator();

      mocks.video.disableCaptions.mockRejectedValue(new Error('Disable error'));

      await expect(
        orchestrator.disableCaptions({
          sessionId: mockSessionId,
          captionsId: 'caption-123',
        })
      ).rejects.toThrow();
    });
  });

  /**
   * Helper function to create a VideoClient instance with mocked dependencies
   */
  function createTestOrchestrator(options?: { videoParams?: object }) {
    const mockVideoInstance = {
      createSession: vi.fn(),
      startArchive: vi.fn(),
      stopArchive: vi.fn(),
      searchArchives: vi.fn(),
      startCaptions: vi.fn(),
      stopCaptions: vi.fn(),
      enableCaptions: vi.fn(),
      disableCaptions: vi.fn(),
      generateClientToken: vi.fn().mockReturnValue('mock-token-12345'),
    };

    const mockAuthInstance = { apiKey: mockApiKey } as Auth;

    (Auth as unknown as Mock).mockImplementation(() => mockAuthInstance);
    (Video as unknown as Mock).mockImplementation(() => mockVideoInstance);

    const orchestrator = createVideoClient({
      auth: {
        authType: 'apiKey',
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
      },
      videoParams: options?.videoParams || {},
    });

    return {
      orchestrator,
      mocks: {
        video: mockVideoInstance,
        auth: mockAuthInstance,
      },
    };
  }
});

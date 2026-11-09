import { describe, it, expect, vi, type Mock } from 'vitest';
import { Video, type SingleArchiveResponse, ArchiveMode } from '@vonage/video';
import { Auth } from '@vonage/auth';
import jwt from 'jsonwebtoken';
import VideoClient from '.';
import { TokenRole, type VideoClientConfig } from '@api-lib/types';
import { SessionKeyClaim } from '@common/constants';
import { tryCatch } from '@common/execution';

vi.mock('@vonage/video');
vi.mock('@vonage/auth');

describe('VideoClient', () => {
  const mockApiKey = 'test-api-key';
  const mockApiSecret = 'test-api-secret';
  const mockSessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
  const mockSessionKey = jwt.sign({ sessionId: mockSessionId }, mockApiKey, { algorithm: 'HS256' });

  const expectedDecodedSession = {
    version: '1',
    partnerId: '12345678',
    applicationId: '12345678',
    p2p: false,
    autoArchive: false,
    location: expect.any(String),
    date: expect.any(String),
  };

  describe('constructor', () => {
    it('should create VideoClient with auth config', () => {
      const videoClient = createVideoClient();

      expect(videoClient).toBeDefined();
      expect(Auth).toHaveBeenCalledWith({
        authType: 'apiKey',
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
      });
    });

    it('should create VideoClient with video params', () => {
      vi.clearAllMocks();

      const videoParams = { timeout: 5000 };

      createVideoClient({ videoParams });

      // VideoClient creates Auth instance from config, so Video receives Auth instance
      expect(Video).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: mockApiKey }),
        videoParams
      );
    });
  });

  describe('createSession', () => {
    it('should create a session with default options', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.createSession.mockResolvedValue({
        sessionId: mockSessionId,
      });

      const result = await videoClient.createSession();

      expect(mocks.video.createSession).toHaveBeenCalledWith(undefined);
      expect(result.sessionId).toBe(mockSessionId);

      // Verify a signed session key was generated containing the session ID
      const decodedSessionKey = jwt.verify(result.sessionKey, mockApiKey) as { sessionId: string };
      expect(decodedSessionKey.sessionId).toBe(mockSessionId);

      // Verify decoded session metadata from the session ID is included
      expect(result).toMatchObject(expectedDecodedSession);
    });

    it('should create a session with custom options', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.createSession.mockResolvedValue({
        sessionId: mockSessionId,
      });

      const sessionOptions = {
        location: '12.34.56.78',
        archiveMode: ArchiveMode.ALWAYS,
      };

      const result = await videoClient.createSession({ sessionOptions });

      expect(mocks.video.createSession).toHaveBeenCalledWith(sessionOptions);
      expect(result.sessionId).toBe(mockSessionId);

      const decodedSessionKey = jwt.verify(result.sessionKey, mockApiKey) as { sessionId: string };
      expect(decodedSessionKey.sessionId).toBe(mockSessionId);
    });

    it('should include roomName in the session key and result', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.createSession.mockResolvedValue({
        sessionId: mockSessionId,
      });

      const result = await videoClient.createSession({ roomName: 'my-room' });

      expect(result.roomName).toBe('my-room');

      const decodedSessionKey = jwt.verify(result.sessionKey, mockApiKey) as {
        sessionId: string;
        roomName: string;
      };
      expect(decodedSessionKey.sessionId).toBe(mockSessionId);
      expect(decodedSessionKey.roomName).toBe('my-room');
    });

    it('signs the schedule without nbf or exp, so the key decodes before its start', async () => {
      expect.assertions(3);

      const { videoClient, mocks } = createVideoClient();

      mocks.video.createSession.mockResolvedValue({
        sessionId: mockSessionId,
      });

      const startsAt = Date.now() + 60 * 60 * 1000;
      const scheduleClaim = { startsAtMs: startsAt, endsAtMs: startsAt + 60 * 60 * 1000 };

      const createdSession = await videoClient.createSession({
        schedule: { startsAt, durationMinutes: 60 },
      });
      const { sessionKey } = createdSession;

      expect(jwt.verify(sessionKey, mockApiKey)).toEqual({
        sessionId: mockSessionId,
        [SessionKeyClaim.schedule]: scheduleClaim,
        iat: expect.any(Number),
      });
      expect(createdSession[SessionKeyClaim.schedule]).toEqual(scheduleClaim);
      expect(videoClient.decodeSessionKey({ sessionKey })[SessionKeyClaim.schedule]).toEqual(
        scheduleClaim
      );
    });

    it('should handle errors from Vonage API', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.createSession.mockRejectedValue(new Error('Vonage API error'));

      await expect(videoClient.createSession()).rejects.toThrow('Failed to create session');
    });
  });

  it('createSessionAndJoin drops a schedule from the payload, so the key it signs has no schedule claim', async () => {
    expect.assertions(1);

    const { videoClient, mocks } = createVideoClient();

    mocks.video.createSession.mockResolvedValue({
      sessionId: mockSessionId,
    });

    const payloadFromLooseParse = {
      roomName: 'my-room',
      schedule: { startsAt: Date.now() + 60 * 60 * 1000, durationMinutes: 60 },
    };

    const { sessionKey } = await videoClient.createSessionAndJoin(payloadFromLooseParse);

    expect(jwt.verify(sessionKey, mockApiKey)).not.toHaveProperty(SessionKeyClaim.schedule);
  });

  describe('decodeSessionId', () => {
    it('should decode a valid sessionId', () => {
      const { videoClient } = createVideoClient();

      const result = videoClient.decodeSessionId({ sessionId: mockSessionId });

      expect(result).toMatchObject(expectedDecodedSession);
    });

    it('should handle invalid sessionId format', () => {
      const { videoClient } = createVideoClient();

      expect(() => {
        videoClient.decodeSessionId({ sessionId: 'invalid-session-id' });
      }).toThrow();
    });

    it('should handle empty sessionId', () => {
      const { videoClient } = createVideoClient();

      expect(() => {
        videoClient.decodeSessionId({ sessionId: '' });
      }).toThrow();
    });
  });

  describe('createEphemeralToken', () => {
    it('should create token with default options', () => {
      const { videoClient } = createVideoClient();

      const result = videoClient.createEphemeralToken({ sessionKey: mockSessionKey });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create token with custom role', () => {
      const { videoClient } = createVideoClient();

      const result = videoClient.createEphemeralToken({
        sessionKey: mockSessionKey,
        clientTokenOptions: {
          role: TokenRole.PUBLISHER,
        },
      });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create token with custom expiration', () => {
      const { videoClient } = createVideoClient();

      const customExpireTime = Date.now() + 3600000;

      const result = videoClient.createEphemeralToken({
        sessionKey: mockSessionKey,
        clientTokenOptions: {
          expireTime: customExpireTime,
        },
      });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create token with custom data', () => {
      const { videoClient } = createVideoClient();

      const result = videoClient.createEphemeralToken({
        sessionKey: mockSessionKey,
        clientTokenOptions: {
          data: 'custom-user-data',
        },
      });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create token with initial layout class list', () => {
      const { videoClient } = createVideoClient();

      const result = videoClient.createEphemeralToken({
        sessionKey: mockSessionKey,
        clientTokenOptions: {
          initialLayoutClassList: ['focus', 'presenter'],
        },
      });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('joinSession', () => {
    it('should join session and return decoded session info with token', () => {
      const { videoClient } = createVideoClient();

      const result = videoClient.joinSession({ sessionKey: mockSessionKey });

      // Verify decoded session metadata from the sessionKey
      expect(result).toMatchObject(expectedDecodedSession);

      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });

    it('should join session with custom token options', () => {
      const { videoClient } = createVideoClient();

      const result = videoClient.joinSession({
        sessionKey: mockSessionKey,
        clientTokenOptions: {
          role: TokenRole.SUBSCRIBER,
          data: 'viewer-data',
        },
      });

      expect(result).toMatchObject(expectedDecodedSession);
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });

    it('should handle invalid sessionId when joining', () => {
      const { videoClient } = createVideoClient();

      expect(() => {
        videoClient.joinSession({ sessionKey: 'invalid' });
      }).toThrow();
    });

    it('refuses a scheduled key before its start without issuing a token', () => {
      const { videoClient, mocks } = createVideoClient();
      const sessionKey = signScheduledSessionKey({
        startsAt: Date.now() + 60 * 60 * 1000,
        durationMinutes: 60,
      });

      const { error } = tryCatch(() => videoClient.joinSession({ sessionKey }));

      expect(error).toMatchObject({ name: 'MeetingNotStartedError', statusCode: 403 });
      expect(mocks.video.generateClientToken).not.toHaveBeenCalled();
    });

    it('refuses a scheduled key after its end without issuing a token', () => {
      const { videoClient, mocks } = createVideoClient();
      const sessionKey = signScheduledSessionKey({
        startsAt: Date.now() - 2 * 60 * 60 * 1000,
        durationMinutes: 60,
      });

      const { error } = tryCatch(() => videoClient.joinSession({ sessionKey }));

      expect(error).toMatchObject({ name: 'MeetingEndedError', statusCode: 403 });
      expect(mocks.video.generateClientToken).not.toHaveBeenCalled();
    });

    it('allows a join exactly at the scheduled start and refuses one exactly at the scheduled end', () => {
      const { videoClient } = createVideoClient();
      const startsAt = Math.floor(Date.now() / 1000) * 1000 + 60 * 60 * 1000;
      const sessionKey = signScheduledSessionKey({ startsAt, durationMinutes: 60 });

      vi.useFakeTimers({ now: startsAt });
      const { error: errorAtStart } = tryCatch(() => videoClient.joinSession({ sessionKey }));
      vi.setSystemTime(startsAt + 60 * 60 * 1000);
      const { error: errorAtEnd } = tryCatch(() => videoClient.joinSession({ sessionKey }));
      vi.useRealTimers();

      expect(errorAtStart).toBeNull();
      expect(errorAtEnd).toMatchObject({ name: 'MeetingEndedError', statusCode: 403 });
    });

    it('never issues a token that outlives the scheduled end', () => {
      const { videoClient, mocks } = createVideoClient();
      const startsAt = Date.now() - 10 * 60 * 1000;
      const sessionKey = signScheduledSessionKey({ startsAt, durationMinutes: 60 });
      const scheduleEndInSeconds = Math.floor(startsAt / 1000) + 60 * 60;

      videoClient.joinSession({
        sessionKey,
        clientTokenOptions: { expireTime: Math.floor(Date.now() / 1000) + 24 * 60 * 60 },
      });

      expect(mocks.video.generateClientToken).toHaveBeenCalledWith(
        mockSessionId,
        expect.objectContaining({ expireTime: scheduleEndInSeconds })
      );
    });
  });

  describe('startArchive', () => {
    it('should start archive successfully', async () => {
      const { videoClient, mocks } = createVideoClient();

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

      const result = await videoClient.startArchive({
        sessionKey: mockSessionKey,
        archiveOptions: {},
      });

      expect(mocks.video.startArchive).toHaveBeenCalledWith(mockSessionId, {});
      expect(result).toMatchObject(mockArchive);
    });

    it('should start archive with options', async () => {
      const { videoClient, mocks } = createVideoClient();

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

      await videoClient.startArchive({
        sessionKey: mockSessionKey,
        archiveOptions,
      });

      expect(mocks.video.startArchive).toHaveBeenCalledWith(mockSessionId, archiveOptions);
    });

    it('should handle errors when starting archive', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.startArchive.mockRejectedValue(new Error('Archive error'));

      await expect(
        videoClient.startArchive({
          archiveOptions: {},
          sessionKey: mockSessionKey,
        })
      ).rejects.toThrow();
    });

    it('refuses a scheduled key after its end without starting an archive', async () => {
      const { videoClient, mocks } = createVideoClient();
      const sessionKey = signScheduledSessionKey({
        startsAt: Date.now() - 2 * 60 * 60 * 1000,
        durationMinutes: 60,
      });

      const { error } = await tryCatch(() =>
        videoClient.startArchive({ sessionKey, archiveOptions: {} })
      );

      expect(error).toMatchObject({ name: 'MeetingEndedError', statusCode: 403 });
      expect(mocks.video.startArchive).not.toHaveBeenCalled();
    });
  });

  describe('stopArchive', () => {
    it('should stop archive successfully', async () => {
      const { videoClient, mocks } = createVideoClient();

      const mockArchive: SingleArchiveResponse = {
        id: 'archive-123',
        status: 'stopped',
      } as SingleArchiveResponse;

      mocks.video.stopArchive.mockResolvedValue(mockArchive);

      const result = await videoClient.stopArchive({
        sessionKey: mockSessionKey,
        archiveId: 'archive-123',
      });

      expect(mocks.video.stopArchive).toHaveBeenCalledWith('archive-123');
      expect(result).toMatchObject(mockArchive);
    });

    it('should handle errors when stopping archive', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.stopArchive.mockRejectedValue(new Error('Stop error'));

      await expect(
        videoClient.stopArchive({
          sessionKey: mockSessionKey,
          archiveId: 'archive-123',
        })
      ).rejects.toThrow();
    });
  });

  describe('searchArchives', () => {
    it('should search archives successfully', async () => {
      const { videoClient, mocks } = createVideoClient();

      const mockArchives = {
        items: [
          { id: 'archive-1', sessionId: mockSessionId },
          { id: 'archive-2', sessionId: mockSessionId },
        ],
        count: 2,
      };

      mocks.video.searchArchives.mockResolvedValue(mockArchives);

      const result = await videoClient.searchArchives({
        sessionKey: mockSessionKey,
      });

      expect(mocks.video.searchArchives).toHaveBeenCalledWith({
        sessionId: mockSessionId,
      });

      expect(result).toMatchObject(mockArchives);
    });

    it('should search archives with filters', async () => {
      const { videoClient, mocks } = createVideoClient();

      const mockArchives = { items: [], count: 0 };

      mocks.video.searchArchives.mockResolvedValue(mockArchives);

      const filters = {
        sessionKey: mockSessionKey,
        offset: 10,
        count: 20,
      };

      await videoClient.searchArchives(filters);

      expect(mocks.video.searchArchives).toHaveBeenCalledWith({
        sessionId: mockSessionId,
        offset: 10,
        count: 20,
      });
    });

    it('should handle errors when searching archives', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.searchArchives.mockRejectedValue(new Error('Search error'));

      await expect(
        videoClient.searchArchives({
          sessionKey: mockSessionKey,
        })
      ).rejects.toThrow();
    });
  });

  describe('enableCaptions', () => {
    it('should enable captions successfully', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.enableCaptions.mockResolvedValue(undefined);

      await videoClient.enableCaptions({
        sessionKey: mockSessionKey,
      });

      expect(mocks.video.enableCaptions).toHaveBeenCalledWith(
        mockSessionId,
        expect.any(String),
        undefined
      );
    });

    it('should enable captions with options', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.enableCaptions.mockResolvedValue(undefined);

      const captionOptions = {
        languageCode: 'en-US',
        maxDuration: 300,
        partialCaptions: 'false' as const,
        statusCallbackUrl: 'https://example.com/callback',
      };

      await videoClient.enableCaptions({
        sessionKey: mockSessionKey,
        captionOptions,
      });

      expect(mocks.video.enableCaptions).toHaveBeenCalledWith(
        mockSessionId,
        expect.any(String),
        captionOptions
      );
    });

    it('should handle errors when enabling captions', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.enableCaptions.mockRejectedValue(new Error('Captions error'));

      await expect(
        videoClient.enableCaptions({
          sessionKey: mockSessionKey,
        })
      ).rejects.toThrow();
    });
  });

  describe('disableCaptions', () => {
    it('should disable captions successfully', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.disableCaptions.mockResolvedValue(undefined);

      await videoClient.disableCaptions({
        sessionKey: mockSessionKey,
        captionsId: 'caption-123',
      });

      expect(mocks.video.disableCaptions).toHaveBeenCalledWith('caption-123');
    });

    it('should handle errors when disabling captions', async () => {
      const { videoClient, mocks } = createVideoClient();

      mocks.video.disableCaptions.mockRejectedValue(new Error('Disable error'));

      await expect(
        videoClient.disableCaptions({
          sessionKey: mockSessionKey,
          captionsId: 'caption-123',
        })
      ).rejects.toThrow();
    });
  });

  describe('constructor options', () => {
    it('should reuse a provided Auth instance instead of building one', () => {
      vi.clearAllMocks();

      const providedAuth = Object.assign(Object.create(Auth.prototype), { apiKey: mockApiKey });
      (Video as unknown as Mock).mockImplementation(() => ({}));

      const videoClient = new VideoClient({ auth: providedAuth, videoParams: {} });

      expect(videoClient.auth).toBe(providedAuth);
      expect(Auth).not.toHaveBeenCalled();
    });

    it('should use the configured session signing secret and algorithm', () => {
      const { videoClient } = createVideoClient({
        sessionSigning: { secret: 'explicit-secret', algorithm: 'HS512' },
      });

      expect(videoClient._sessionSigning).toEqual({
        secret: 'explicit-secret',
        algorithm: 'HS512',
      });
    });

    it('should sign with the application id when no secret is configured', () => {
      const { videoClient } = createVideoClient({ authInstance: { applicationId: 'app-id' } });

      expect(videoClient._sessionSigning).toEqual({ secret: 'app-id', algorithm: 'HS256' });
    });

    it('should resolve a function default against the payload', async () => {
      const { videoClient, mocks } = createVideoClient({
        handlersDefaults: {
          startArchive: ({ sessionKey }: { sessionKey: string }) => ({
            archiveOptions: { name: `archive-${sessionKey.length}` },
          }),
        },
      });

      mocks.video.startArchive.mockResolvedValue({ id: 'archive-id' } as SingleArchiveResponse);

      await videoClient.startArchive({ sessionKey: mockSessionKey });

      expect(mocks.video.startArchive).toHaveBeenCalledWith(mockSessionId, {
        name: `archive-${mockSessionKey.length}`,
      });
    });
  });

  /**
   * Helper function to create a VideoClient instance with mocked dependencies
   */
  function createVideoClient(options?: {
    videoParams?: object;
    sessionSigning?: VideoClientConfig['sessionSigning'];
    handlersDefaults?: VideoClientConfig['handlersDefaults'];
    authInstance?: Partial<Auth>;
  }) {
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

    const mockAuthInstance = { apiKey: mockApiKey, ...options?.authInstance } as Auth;

    (Auth as unknown as Mock).mockImplementation(() => mockAuthInstance);
    (Video as unknown as Mock).mockImplementation(() => mockVideoInstance);

    const videoClient = new VideoClient({
      auth: {
        authType: 'apiKey',
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
      },
      videoParams: options?.videoParams || {},
      ...(options?.sessionSigning ? { sessionSigning: options.sessionSigning } : {}),
      ...(options?.handlersDefaults ? { handlersDefaults: options.handlersDefaults } : {}),
    });

    return {
      videoClient,
      mocks: {
        video: mockVideoInstance,
        auth: mockAuthInstance,
      },
    };
  }

  function signScheduledSessionKey({
    startsAt,
    durationMinutes,
  }: {
    startsAt: number;
    durationMinutes: number;
  }) {
    return jwt.sign(
      {
        sessionId: mockSessionId,
        [SessionKeyClaim.schedule]: {
          startsAtMs: startsAt,
          endsAtMs: startsAt + durationMinutes * 60 * 1000,
        },
      },
      mockApiKey,
      { algorithm: 'HS256' }
    );
  }
});

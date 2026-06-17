import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import type { AddressInfo, Server } from 'node:net';
import request from 'supertest';
import jwt from 'jsonwebtoken';
// eslint-disable-next-line @nx/enforce-module-boundaries
import mockOpentokConfig from '../../backend/helpers/__mocks__/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import createVideoClient from '../../libs/core/src/services/videoClient/createVideoClient';

// base64('2~vonageAppId~0.0.0.0~2024-01-01') — valid format for decodeSessionId
const validSessionId = '1_Mn52b25hZ2VBcHBJZH4wLjAuMC4wfjIwMjQtMDEtMDE=';

// JWT signed with 'mock-api-key' containing { sessionId: validSessionId } — valid sessionKey
const validSessionKey = jwt.sign({ sessionId: validSessionId }, 'mock-api-key', {
  algorithm: 'HS256',
});

// ─── Exposed mock functions so individual tests can adjust behavior ──────────

const mockCreateSession = jest
  .fn<() => Promise<{ sessionId: string }>>()
  .mockResolvedValue({ sessionId: validSessionId });

const mockStartArchive = jest
  .fn<() => Promise<{ id: string; status: string }>>()
  .mockResolvedValue({ id: 'archive-1', status: 'started' });

const mockStopArchive = jest
  .fn<(archiveId: string) => Promise<{ id: string; status: string }>>()
  .mockImplementation((archiveId: string) => {
    if (archiveId === 'bad-archive-id') {
      return Promise.reject(new Error('archive not found'));
    }
    return Promise.resolve({ id: archiveId, status: 'stopped' });
  });

const mockSearchArchives = jest
  .fn<() => Promise<{ items: Array<{ id: string }>; count: number }>>()
  .mockResolvedValue({ items: [{ id: 'archive-1' }, { id: 'archive-2' }], count: 2 });

const mockEnableCaptions = jest
  .fn<() => Promise<{ captionsId: string }>>()
  .mockResolvedValue({ captionsId: 'mock-captions-id' });

const mockDisableCaptions = jest
  .fn<(captionsId: string) => Promise<void>>()
  .mockImplementation((captionsId: string) => {
    if (captionsId === 'wrongCaptionId') {
      return Promise.reject(new Error('Invalid caption ID'));
    }
    return Promise.resolve(undefined);
  });

// ─── Module mocks (must be awaited before any import of the server) ───────────

await jest.unstable_mockModule('../../backend/helpers/config', mockOpentokConfig);

const actualAuth = await import('@vonage/auth');
const actualVideo = await import('@vonage/video');

await jest.unstable_mockModule('@vonage/auth', () => ({
  ...actualAuth,
  Auth: jest.fn().mockImplementation(() => ({ apiKey: 'mock-api-key' })),
}));

await jest.unstable_mockModule('@vonage/video', () => ({
  ...actualVideo,
  Video: jest.fn().mockImplementation(() => ({
    createSession: mockCreateSession,
    generateClientToken: jest.fn().mockReturnValue('some-token'),
    startArchive: mockStartArchive,
    stopArchive: mockStopArchive,
    searchArchives: mockSearchArchives,
    enableCaptions: mockEnableCaptions,
    disableCaptions: mockDisableCaptions,
  })),
}));

const mockReportIssue = jest
  .fn<() => Promise<{ message: string; ticketUrl: string }>>()
  .mockResolvedValue({
    message: 'Your Jira ticket has been created.',
    ticketUrl: 'https://jira.com/browse/key-123',
  });

await jest.unstable_mockModule('../../backend/services/getFeedbackService.ts', () => ({
  default: jest.fn(() => ({ reportIssue: mockReportIssue })),
}));

const mockForward = jest.fn<() => Promise<void>>();

// eslint-disable-next-line @nx/enforce-module-boundaries
const actualLoggerService = await import('../../backend/services/loggerService');

await jest.unstable_mockModule('../../backend/services/loggerService.ts', () => ({
  ...actualLoggerService,
  forward: mockForward,
}));

// ─── Server setup ─────────────────────────────────────────────────────────────

process.env.VIDEO_SERVICE_PROVIDER = 'opentok';

// eslint-disable-next-line @nx/enforce-module-boundaries
const startServer = (await import('../../backend/server')).default;

// ─── Valid ClientLogEvent payload (matches ClientLogEventSchema) ───────────────

const validLogEvent = {
  action: 'UserJoined',
  level: 'info',
  source: 'vera-frontend',
  guid: 'test-guid-123',
  clientSystemTime: Date.now(),
  userAgent: 'Mozilla/5.0',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('API Integrity', () => {
  let server: Server;
  let videoClient: ReturnType<typeof createVideoClient>;

  beforeAll(async () => {
    server = await startServer(0);
    const { port } = server.address() as AddressInfo;
    videoClient = createVideoClient({ url: `http://127.0.0.1:${port}/v2` });
  });

  afterAll((done) => {
    server.close(done);
  });

  // ─── /v2 createSession ──────────────────────────────────────────────────────

  describe('createSession', () => {
    it('returns the new session id', async () => {
      const response = await videoClient.createSession();

      expect(response).toMatchObject({ sessionId: validSessionId });
    });

    it('rejects when the Video SDK fails', async () => {
      mockCreateSession.mockRejectedValueOnce(new Error('SDK unavailable'));

      await expect(videoClient.createSession()).rejects.toThrow();
    });
  });

  // ─── /v2 joinSession ────────────────────────────────────────────────────────

  describe('joinSession', () => {
    it('returns a client token for a valid session id', async () => {
      const response = await videoClient.joinSession({ sessionKey: validSessionKey });

      expect(response).toMatchObject({ token: 'some-token' });
    });

    it('rejects when sessionKey is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(videoClient.joinSession({} as any)).rejects.toThrow();
    });
  });

  // ─── /v2 startArchive ───────────────────────────────────────────────────────

  describe('startArchive', () => {
    it('returns the started archive data', async () => {
      const response = await videoClient.startArchive({ sessionKey: validSessionKey });

      expect(response).toMatchObject({ id: 'archive-1', status: 'started' });
    });

    it('rejects when sessionKey is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(videoClient.startArchive({} as any)).rejects.toThrow();
    });
  });

  // ─── /v2 stopArchive ────────────────────────────────────────────────────────

  describe('stopArchive', () => {
    it('returns the stopped archive data', async () => {
      const response = await videoClient.stopArchive({
        archiveId: 'archive-1',
        sessionKey: validSessionKey,
      });

      expect(response).toMatchObject({ id: 'archive-1', status: 'stopped' });
    });

    it('rejects when the Video SDK rejects the archive id', async () => {
      await expect(
        videoClient.stopArchive({ archiveId: 'bad-archive-id', sessionKey: validSessionKey })
      ).rejects.toThrow();
    });
  });

  // ─── /v2 searchArchives ──────────────────────────────────────────────────────

  describe('searchArchives', () => {
    it('returns a list of archives', async () => {
      const response = await videoClient.searchArchives({ sessionKey: validSessionKey });

      expect(response).toMatchObject({
        count: 2,
        items: [{ id: 'archive-1' }, { id: 'archive-2' }],
      });
    });

    it('rejects when the Video SDK fails', async () => {
      mockSearchArchives.mockRejectedValueOnce(new Error('SDK failure'));

      await expect(videoClient.searchArchives({ sessionKey: validSessionKey })).rejects.toThrow();
    });
  });

  // ─── /v2 enableCaptions ─────────────────────────────────────────────────────

  describe('enableCaptions', () => {
    it('resolves when captions are enabled', async () => {
      const { sessionKey } = await videoClient.createSession({ roomName: 'captions-test-room' });

      await expect(videoClient.enableCaptions({ sessionKey })).resolves.toBeDefined();
    });

    it('rejects when sessionKey is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(videoClient.enableCaptions({} as any)).rejects.toThrow();
    });
  });

  // ─── /v2 disableCaptions ────────────────────────────────────────────────────

  describe('disableCaptions', () => {
    it('resolves when captions are disabled', async () => {
      const { sessionKey } = await videoClient.createSession({ roomName: 'captions-disable-room' });

      // Enable captions first so the room has a captions user count
      await videoClient.enableCaptions({ sessionKey });

      await expect(
        videoClient.disableCaptions({
          captionsId: 'mock-captions-id',
          sessionKey,
        })
      ).resolves.toBeUndefined();
    });

    it('rejects when the Video SDK rejects the captions id', async () => {
      const { sessionKey } = await videoClient.createSession({ roomName: 'captions-fail-room' });
      await videoClient.enableCaptions({ sessionKey });

      await expect(
        videoClient.disableCaptions({
          captionsId: 'wrongCaptionId',
          sessionKey,
        })
      ).rejects.toThrow();
    });
  });

  // ─── POST /feedback/report (no tRPC equivalent) ─────────────────────────────

  describe('POST /feedback/report', () => {
    it('returns 200 when feedback is submitted with all required fields', async () => {
      const res = await request(server)
        .post('/feedback/report')
        .set('Content-Type', 'application/json')
        .send({ title: 'Audio issue', name: 'Jane', issue: 'Cannot hear others', attachment: '' });

      expect(res.statusCode).toBe(200);
      expect(res.body.feedbackData).toMatchObject({ ticketUrl: expect.any(String) });
    });

    it('returns 500 when the feedback service fails', async () => {
      mockReportIssue.mockRejectedValueOnce(new Error('service unavailable'));

      const res = await request(server)
        .post('/feedback/report')
        .set('Content-Type', 'application/json')
        .send({ title: 'Bug', name: 'Test', issue: 'Fails', attachment: '' });

      expect(res.statusCode).toBe(500);
    });
  });

  // ─── POST /client-logs (no tRPC equivalent) ─────────────────────────────────

  describe('POST /client-logs', () => {
    beforeEach(() => {
      mockForward.mockResolvedValue(undefined);
    });

    afterEach(() => {
      mockForward.mockReset();
    });

    it('returns 204 when a valid log event is received', async () => {
      const res = await request(server)
        .post('/client-logs')
        .set('Content-Type', 'application/json')
        .send(validLogEvent);

      expect(res.statusCode).toBe(204);
    });

    it('returns 400 when the log payload is invalid', async () => {
      const res = await request(server)
        .post('/client-logs')
        .set('Content-Type', 'application/json')
        .send({ level: 'unknown-level', action: '' });

      expect(res.statusCode).toBe(400);
    });
  });

  // ─── /v2 endpoints via fetch (supertest) ─────────────────────────────────────

  describe('v2 endpoints (fetch)', () => {
    function extractData<T>(body: unknown): T {
      return (body as { result: { data: T } }).result.data;
    }

    describe('POST /v2/createSession', () => {
      it('returns a session id', async () => {
        const response = await request(server).post('/v2/createSession').send({}).expect(200);

        const data = extractData<{ sessionId: string }>(response.body);
        expect(data).toMatchObject({ sessionId: validSessionId });
      });

      it('returns an error when the SDK fails', async () => {
        mockCreateSession.mockRejectedValueOnce(new Error('SDK unavailable'));

        const response = await request(server).post('/v2/createSession').send({});

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /v2/joinSession', () => {
      it('returns a client token for a valid session id', async () => {
        const response = await request(server)
          .post('/v2/joinSession')
          .send({ sessionKey: validSessionKey })
          .expect(200);

        const data = extractData<{ token: string }>(response.body);
        expect(data).toMatchObject({ token: 'some-token' });
      });

      it('returns an error when sessionKey is missing', async () => {
        const response = await request(server).post('/v2/joinSession').send({});

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /v2/startArchive', () => {
      it('returns the started archive data', async () => {
        const response = await request(server)
          .post('/v2/startArchive')
          .send({ sessionKey: validSessionKey })
          .expect(200);

        const data = extractData<{ id: string; status: string }>(response.body);
        expect(data).toMatchObject({ id: 'archive-1', status: 'started' });
      });

      it('returns an error when sessionKey is missing', async () => {
        const response = await request(server).post('/v2/startArchive').send({});

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /v2/stopArchive', () => {
      it('returns the stopped archive data', async () => {
        const response = await request(server)
          .post('/v2/stopArchive')
          .send({ archiveId: 'archive-1', sessionKey: validSessionKey })
          .expect(200);

        const data = extractData<{ id: string; status: string }>(response.body);
        expect(data).toMatchObject({ id: 'archive-1', status: 'stopped' });
      });

      it('returns an error when the archive id is invalid', async () => {
        const response = await request(server)
          .post('/v2/stopArchive')
          .send({ archiveId: 'bad-archive-id', sessionKey: validSessionKey });

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /v2/searchArchives', () => {
      it('returns a list of archives', async () => {
        const response = await request(server)
          .post('/v2/searchArchives')
          .send({ sessionKey: validSessionKey })
          .expect(200);

        const data = extractData<{ items: Array<{ id: string }>; count: number }>(response.body);
        expect(data).toMatchObject({
          count: 2,
          items: [{ id: 'archive-1' }, { id: 'archive-2' }],
        });
      });

      it('returns an error when the SDK fails', async () => {
        mockSearchArchives.mockRejectedValueOnce(new Error('SDK failure'));

        const response = await request(server)
          .post('/v2/searchArchives')
          .send({ sessionKey: validSessionKey });

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /v2/enableCaptions', () => {
      it('resolves when captions are enabled', async () => {
        const createResponse = await request(server)
          .post('/v2/createSession')
          .send({ roomName: 'fetch-captions-room' })
          .expect(200);
        const { sessionKey } = extractData<{ sessionKey: string }>(createResponse.body);

        const response = await request(server)
          .post('/v2/enableCaptions')
          .send({ sessionKey })
          .expect(200);

        expect(response.body.result).toBeDefined();
      });

      it('returns an error when sessionKey is missing', async () => {
        const response = await request(server).post('/v2/enableCaptions').send({});

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /v2/disableCaptions', () => {
      it('resolves when captions are disabled', async () => {
        const createResponse = await request(server)
          .post('/v2/createSession')
          .send({ roomName: 'fetch-disable-room' })
          .expect(200);
        const { sessionKey } = extractData<{ sessionKey: string }>(createResponse.body);
        await request(server).post('/v2/enableCaptions').send({ sessionKey });

        const response = await request(server)
          .post('/v2/disableCaptions')
          .send({
            captionsId: 'mock-captions-id',
            sessionKey,
          })
          .expect(200);

        expect(response.body.result).toBeDefined();
      });

      it('returns an error when the captions id is invalid', async () => {
        const createResponse = await request(server)
          .post('/v2/createSession')
          .send({ roomName: 'fetch-disable-fail-room' })
          .expect(200);
        const { sessionKey } = extractData<{ sessionKey: string }>(createResponse.body);
        await request(server).post('/v2/enableCaptions').send({ sessionKey });

        const response = await request(server).post('/v2/disableCaptions').send({
          captionsId: 'wrongCaptionId',
          sessionKey,
        });

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.error).toBeDefined();
      });
    });
  });

  // ─── Session lifecycle with observability webhooks ────────────────────────────

  describe('session lifecycle with observability webhooks', () => {
    const lifecycleCaptionsId = 'lifecycle-captions-id';
    const lifecycleArchiveId = 'lifecycle-archive-id';
    const lifecycleRoomName = 'lifecycle-room';

    it('creates a session, enables captions and an archive, then cleans up on sessionDestroyed', async () => {
      mockEnableCaptions.mockResolvedValueOnce({ captionsId: lifecycleCaptionsId });
      mockStartArchive.mockResolvedValueOnce({ id: lifecycleArchiveId, status: 'started' });

      // Create a session and store state via onSettled$ — use videoClient so sessionKey is registered in storage
      const { sessionKey } = await videoClient.createSession({ roomName: lifecycleRoomName });

      // Enable captions — stores captionsId keyed by sessionId
      await videoClient.enableCaptions({ sessionKey });

      // Start archive — archiveId gets stored via /hooks/archive webhook
      await videoClient.startArchive({ sessionKey });

      // Simulate Vonage webhook: archive started
      await request(server)
        .post('/v2/hooks/archive')
        .send({
          sessionId: validSessionId,
          id: lifecycleArchiveId,
          status: 'started',
          createdAt: Date.now(),
          size: 0,
          duration: 0,
          name: '',
          partnerId: 'test-partner',
          reason: '',
          sha256sum: '',
          password: '',
          updatedAt: Date.now(),
          resolution: '640x480',
          streamMode: 'auto',
          multiArchiveTag: '',
          url: null,
          event: 'archive',
        })
        .expect(200);

      // Simulate Vonage webhook: captions started
      await request(server)
        .post('/v2/hooks/captions')
        .send({
          captionId: lifecycleCaptionsId,
          projectId: 'test-project',
          sessionId: validSessionId,
          status: 'started',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          provider: 'aws-transcribe',
          languageCode: 'en-US',
          stream: { streamId: 'test-stream', streamStatus: 'started' },
          group: 'captions',
        })
        .expect(200);

      // Simulate Vonage webhook: session destroyed — should trigger disableCaptions + stopArchive
      mockDisableCaptions.mockResolvedValueOnce(undefined);
      mockStopArchive.mockResolvedValueOnce({ id: lifecycleArchiveId, status: 'stopped' });

      await request(server)
        .post('/v2/hooks/session')
        .send({
          sessionId: validSessionId,
          event: 'sessionDestroyed',
          timestamp: Date.now(),
          reason: 'clientDisconnected',
        })
        .expect(200);

      expect(mockDisableCaptions).toHaveBeenCalledWith(lifecycleCaptionsId);
      expect(mockStopArchive).toHaveBeenCalledWith(lifecycleArchiveId);
    });

    it('handles a second sessionDestroyed gracefully when state is already cleared', async () => {
      const callsBefore = mockDisableCaptions.mock.calls.length + mockStopArchive.mock.calls.length;

      await request(server)
        .post('/v2/hooks/session')
        .send({
          sessionId: validSessionId,
          event: 'sessionDestroyed',
          timestamp: Date.now(),
          reason: 'clientDisconnected',
        })
        .expect(200);

      const callsAfter = mockDisableCaptions.mock.calls.length + mockStopArchive.mock.calls.length;
      expect(callsAfter).toBe(callsBefore);
    });
  });
});

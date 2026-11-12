import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import type { ClientLogEvent } from '@common/types';

vi.doMock('../../helpers/config', () => ({
  default: vi.fn().mockImplementation(() => ({
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    applicationId: 'test-application-id',
    privateKey: 'test-private-key',
    provider: 'opentok',
    gollumUrl: 'https://example.com',
    loggerVerbose: false,
  })),
}));
vi.doMock('axios', () => ({
  default: { post: vi.fn(() => Promise.resolve({ status: 200 })) },
}));

const { default: axiosMock } = await import('axios');
const { forwardToGollum, forward, logOnConnect } = await import('../loggerService');

const createValidClientLogEvent = (overrides?: Partial<ClientLogEvent>): ClientLogEvent => ({
  action: 'EnterMeeting',
  variation: 'Success',
  session: { sessionId: 's1', connectionId: 'c1', partnerId: 'apiKey' },
  sessionId: 's1',
  connectionId: 'c1',
  partnerId: 'apiKey',
  clientSystemTime: Date.now(),
  source: 'https://example.com',
  guid: crypto.randomUUID(),
  userAgent: 'Mozilla/5.0',
  level: 'info',
  ...overrides,
});

describe('loggerService', () => {
  const mockPost = axiosMock.post as MockedFunction<typeof axiosMock.post>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ status: 200 });
  });

  describe('forwardToGollum', () => {
    it('should POST to gollumUrl with mapped payload and serverReceivedTime', async () => {
      const event = createValidClientLogEvent({
        action: 'vonageVideoClient.connect.success',
        session: { sessionId: 's1', connectionId: 'c1', partnerId: '100' },
        sessionId: 's1',
        connectionId: 'c1',
        partnerId: '100',
      });

      await forwardToGollum(event);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          action: 'vonageVideoClient.connect.success',
          variation: 'Success',
          session: { sessionId: 's1', connectionId: 'c1', partnerId: '100' },
          sessionId: 's1',
          connectionId: 'c1',
          partnerId: '100',
          clientSystemTime: event.clientSystemTime,
          source: event.source,
          guid: event.guid,
          userAgent: event.userAgent,
          serverReceivedTime: expect.any(Number),
        }),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
          validateStatus: expect.any(Function),
        })
      );
    });

    it('should include payload when present', async () => {
      const event = createValidClientLogEvent({
        payload: { error: { message: 'Something broke', name: 'Error' } },
      });

      await forwardToGollum(event);

      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          payload: { error: { message: 'Something broke', name: 'Error' } },
        }),
        expect.any(Object)
      );
    });

    it('redacts sensitive keys from the payload before forwarding', async () => {
      const event = createValidClientLogEvent({
        payload: {
          token: 'secret-jwt',
          authorization: 'Bearer abc123',
          user: { password: 'hunter2', name: 'Bob' },
          note: 'safe value',
        },
      });

      await forwardToGollum(event);

      const forwardedBody = mockPost.mock.calls[0][1] as { payload: Record<string, unknown> };
      expect(forwardedBody.payload).toEqual({
        token: '[REDACTED]',
        authorization: '[REDACTED]',
        user: { password: '[REDACTED]', name: 'Bob' },
        note: 'safe value',
      });
    });

    it('should reject when axios.post fails (route catches via attempt)', async () => {
      const event = createValidClientLogEvent();

      mockPost.mockRejectedValue(new Error('Network error'));

      await expect(forwardToGollum(event)).rejects.toThrow('Network error');
    });
  });

  describe('forward', () => {
    it('forwards to Gollum and for EnterMeeting also sends via OTKAnalytics', async () => {
      const payload = createValidClientLogEvent({
        action: 'EnterMeeting',
        session: { sessionId: 's1', connectionId: 'c1', partnerId: 'apiKey' },
        sessionId: 's1',
        connectionId: 'c1',
        partnerId: 'apiKey',
      });

      await forward(payload);

      expect(mockPost).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          action: 'EnterMeeting',
          session: { sessionId: 's1', connectionId: 'c1', partnerId: 'apiKey' },
          sessionId: 's1',
          connectionId: 'c1',
          partnerId: 'apiKey',
          serverReceivedTime: expect.any(Number),
        }),
        expect.any(Object)
      );
    });
  });

  describe('logOnConnect', () => {
    const apiKey = 'api-key';
    const sessionId = 'session-id';

    it('does not send when connectionId is missing', () => {
      const callsBefore = mockPost.mock.calls.length;
      logOnConnect({
        sessionId,
        connectionId: undefined,
        partnerId: apiKey,
        action: 'EnterMeeting',
        clientSystemTime: Date.now(),
        source: 'https://example.com',
        guid: crypto.randomUUID(),
        level: 'info',
        userAgent: 'Mozilla/5.0',
      });
      expect(mockPost.mock.calls.length).toBe(callsBefore);
    });

    it('invokes OTKAnalytics and sends EnterMeeting when connected', () => {
      expect(() =>
        logOnConnect({
          sessionId,
          connectionId: 'connection-id',
          partnerId: apiKey,
          action: 'EnterMeeting',
          clientSystemTime: Date.now(),
          source: 'https://example.com',
          guid: crypto.randomUUID(),
          level: 'info',
          userAgent: 'Mozilla/5.0',
        })
      ).not.toThrow();
    });
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { MockInstance } from 'vitest';
import type { ClientLogEvent } from '@common/types';

vi.doMock('../../helpers/config', () => ({
  default: vi.fn().mockImplementation(() => ({
    gollumUrl: undefined,
    loggerVerbose: false,
  })),
}));
vi.doMock('axios', () => ({
  default: { post: vi.fn() },
}));

const { forwardToGollum, forward, resetGollumWarning } = await import('../loggerService');

const createValidClientLogEvent = (overrides?: Partial<ClientLogEvent>): ClientLogEvent => ({
  action: 'EnterMeeting',
  variation: 'Success',
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

describe('loggerService (GOLLUM_BASE_URL not configured)', () => {
  let warnSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    resetGollumWarning();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('forwardToGollum', () => {
    it('should warn once and return silently when gollumUrl is not configured', async () => {
      const event = createValidClientLogEvent();

      await forwardToGollum(event);
      await forwardToGollum(event);
      await forwardToGollum(event);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('GOLLUM_BASE_URL not configured')
      );
    });

    it('should not throw when gollumUrl is not configured', async () => {
      const event = createValidClientLogEvent();

      await expect(forwardToGollum(event)).resolves.toBeUndefined();
    });
  });

  describe('forward', () => {
    it('should still call logOnConnect for EnterMeeting events when gollumUrl is not configured', async () => {
      const event = createValidClientLogEvent({
        action: 'EnterMeeting',
        sessionId: 's1',
        connectionId: 'c1',
        partnerId: 'apiKey',
      });

      await expect(forward(event)).resolves.toBeUndefined();
    });
  });
});

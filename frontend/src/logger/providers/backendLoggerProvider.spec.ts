import { vi, describe, it, beforeEach, expect, type MockInstance } from 'vitest';
import { createBackendLoggingProvider } from './backendLoggerProvider';

const { MOCK_API_URL, MOCK_VERSION } = vi.hoisted(() => ({
  MOCK_API_URL: 'https://api.test',
  MOCK_VERSION: 'vera-1.0.0-test',
}));

vi.mock('../../utils/constants', () => ({
  API_URL: MOCK_API_URL,
}));

vi.mock('../../utils/getAppVersion', () => ({
  default: () => MOCK_VERSION,
}));

describe('createBackendLoggingProvider', () => {
  let fetchSpy: MockInstance<
    [input: string | URL | Request, init?: RequestInit],
    Promise<Response>
  >;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true } as Response);
  });

  it('log() sends POST with ClientLogEvent shape and does not throw', () => {
    const provider = createBackendLoggingProvider();

    expect(() => {
      provider.log('vonageVideoClient.connect.success', {
        sessionId: 's1',
        connectionId: 'c1',
        partnerId: 'apiKey',
        custom: 'data',
      });
    }).not.toThrow();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${MOCK_API_URL}/internal/client-logs`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      })
    );

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({
      action: 'vonageVideoClient.connect.success',
      variation: 'Success',
      level: 'info',
      sessionId: 's1',
      connectionId: 'c1',
      clientVersion: MOCK_VERSION,
      name: 'vera',
      componentId: 'vera',
      partnerId: 'apiKey',
    });
    expect(body.payload).toMatchObject({ custom: 'data' });
    expect(body.guid).toBeDefined();
    expect(body.clientSystemTime).toBeDefined();
    expect(body.userAgent).toBeDefined();
  });

  it('reportError() sends POST with error payload and variation from error.name', () => {
    const provider = createBackendLoggingProvider();
    const err = new Error('Something broke');

    expect(() => {
      provider.reportError(err, { sessionId: 's2', context: 'test' });
    }).not.toThrow();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${MOCK_API_URL}/internal/client-logs`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({
      action: 'Error',
      variation: 'Error',
      level: 'error',
      sessionId: 's2',
      clientVersion: MOCK_VERSION,
    });
    expect(body.payload?.error).toMatchObject({
      message: 'Something broke',
      name: 'Error',
    });
    expect(typeof body.payload?.error?.stack).toBe('string');
    expect(body.payload?.context).toBe('test');
  });

  it('reportError() uses error.name as variation for non-Error objects with name', () => {
    const provider = createBackendLoggingProvider();
    const custom = Object.assign(new Error('msg'), { name: 'CustomError' });

    provider.reportError(custom, {});

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.variation).toBe('CustomError');
  });

  describe('error handling (provider never throws)', () => {
    it('log() does not throw when fetch rejects', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));
      const provider = createBackendLoggingProvider();

      expect(() => provider.log('Event', {})).not.toThrow();

      await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    });

    it('reportError() does not throw when fetch rejects', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));
      const provider = createBackendLoggingProvider();

      expect(() => provider.reportError(new Error('App error'), {})).not.toThrow();

      await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    });
  });
});

import { vi, describe, it, beforeEach, expect, type MockInstance } from 'vitest';
import { BackendLoggingProvider } from './backendLoggingProvider';

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

describe('BackendLoggingProvider', () => {
  let fetchSpy: MockInstance<
    [input: string | URL | Request, init?: RequestInit],
    Promise<Response>
  >;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response);
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
  });

  it('log() sends POST with ClientLogEvent shape and does not throw', () => {
    const provider = new BackendLoggingProvider();

    expect(() => {
      provider.log('vonageVideoClient.connect.success', {
        sessionId: 's1',
        connectionId: 'c1',
        partnerId: 'apiKey',
        custom: 'data',
      });
    }).not.toThrow();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${MOCK_API_URL}/client-logs`,
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
      clientVersion: MOCK_VERSION,
      name: 'vera',
      componentId: 'vera',
      sessionId: 's1',
      connectionId: 'c1',
      partnerId: 'apiKey',
    });
    expect(body.payload).toMatchObject({ custom: 'data' });
    expect(body.guid).toBeDefined();
    expect(body.clientSystemTime).toBeDefined();
    expect(body.userAgent).toBeDefined();
  });

  it('reportError() sends POST with error payload and variation from error.name', () => {
    const provider = new BackendLoggingProvider();
    const err = new Error('Something broke');

    expect(() => {
      provider.reportError(err, { sessionId: 's2', context: 'test' });
    }).not.toThrow();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${MOCK_API_URL}/client-logs`,
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
      clientVersion: MOCK_VERSION,
      sessionId: 's2',
    });
    expect(body.payload).toMatchObject({ context: 'test' });
  });

  it('reportError() uses error.name as variation for non-Error objects with name', () => {
    const provider = new BackendLoggingProvider();
    const custom = Object.assign(new Error('msg'), { name: 'CustomError' });

    provider.reportError(custom, {});

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.variation).toBe('CustomError');
  });
});

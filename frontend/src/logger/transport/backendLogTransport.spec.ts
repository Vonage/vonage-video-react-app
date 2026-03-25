import { vi, describe, it, beforeEach, expect, type MockInstance } from 'vitest';
import { BackendLogTransport } from './index';
import { createClientEvent } from '../event';

const MOCK_API_URL = vi.hoisted(() => 'https://api.test');

vi.mock('../../utils/constants', () => ({
  API_URL: MOCK_API_URL,
}));

vi.mock('../../utils/getAppVersion', () => ({
  default: () => 'vera-1.0.0-test',
}));

vi.mock('../event', () => ({
  createClientEvent: vi.fn().mockReturnValue({
    action: 'Test',
    level: 'info',
    guid: 'guid-1',
    clientSystemTime: 0,
    source: 'test',
    userAgent: '',
  }),
}));

const mockCreateClientEvent = vi.mocked(createClientEvent);

describe('BackendLogTransport', () => {
  let fetchSpy!: MockInstance<
    [input: string | URL | Request, init?: RequestInit],
    Promise<Response>
  >;
  let sendBeaconSpy!: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response);
    sendBeaconSpy = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeaconSpy, configurable: true });
  });

  it('log() uses sendBeacon when available', () => {
    const transport = new BackendLogTransport();
    transport.log('Test', { sessionId: 's1', connectionId: 'c1', partnerId: 'p1' });

    expect(sendBeaconSpy).toHaveBeenCalledWith(`${MOCK_API_URL}/client-logs`, expect.any(Blob));
    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBeGreaterThan(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('log() falls back to fetch when sendBeacon unavailable', () => {
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
    const transport = new BackendLogTransport();
    transport.log('Test', { sessionId: 's1', connectionId: 'c1', partnerId: 'p1' });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${MOCK_API_URL}/client-logs`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('log() does not throw when sendBeacon returns false', () => {
    sendBeaconSpy.mockReturnValue(false);
    const transport = new BackendLogTransport();

    expect(() => transport.log('Test', {})).not.toThrow();
  });

  it('reportError() uses sendBeacon when available', () => {
    const transport = new BackendLogTransport();
    transport.reportError(new Error('Test error'), { sessionId: 's1' });

    expect(sendBeaconSpy).toHaveBeenCalledWith(`${MOCK_API_URL}/client-logs`, expect.any(Blob));
    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('log() passes userId to createClientEvent when provided in extra', () => {
    const transport = new BackendLogTransport();
    transport.log('Test', { userId: 'user-123', sessionId: 's1' });

    expect(mockCreateClientEvent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-123' })
    );
  });

  it('reportError() passes userId to createClientEvent when provided in extra', () => {
    const transport = new BackendLogTransport();
    transport.reportError(new Error('fail'), { userId: 'user-456' });

    expect(mockCreateClientEvent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-456' })
    );
  });
});

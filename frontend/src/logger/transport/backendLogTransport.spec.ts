import { vi, describe, it, beforeEach, expect, type MockInstance } from 'vitest';
import { BackendLogTransport } from './index';

const MOCK_API_URL = vi.hoisted(() => 'https://api.test');

vi.mock('../../utils/constants', () => ({
  API_URL: MOCK_API_URL,
}));

describe('BackendLogTransport', () => {
  let fetchSpy: MockInstance<
    [input: string | URL | Request, init?: RequestInit],
    Promise<Response>
  >;
  let sendBeaconSpy: ReturnType<typeof vi.fn>;
  let pagehideHandler: (evt?: Event) => void;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true } as Response);
    sendBeaconSpy = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeaconSpy, configurable: true });
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (event: string, listener: EventListenerOrEventListenerObject) => {
        if (event === 'pagehide') {
          pagehideHandler =
            typeof listener === 'function'
              ? (evt?: Event) => listener(evt ?? ({} as Event))
              : (evt?: Event) => listener.handleEvent(evt ?? ({} as Event));
        }
      }
    );
  });

  it('send() POSTs to API_URL/internal/client-logs with JSON body and correct options', () => {
    const transport = new BackendLogTransport();
    const event = {
      action: 'Test',
      level: 'info' as const,
      clientSystemTime: 1,
      userAgent: '',
      guid: 'guid-1',
    };

    transport.send(event as Parameters<BackendLogTransport['send']>[0]);

    expect(fetchSpy).toHaveBeenCalledWith(
      `${MOCK_API_URL}/internal/client-logs`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('send() does not throw when fetch rejects', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error'));
    const transport = new BackendLogTransport();
    const event = {
      action: 'Test',
      level: 'info' as const,
      clientSystemTime: 1,
      userAgent: '',
      guid: 'guid-1',
    };

    expect(() => transport.send(event as Parameters<BackendLogTransport['send']>[0])).not.toThrow();

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it('pagehide flushes pending events via sendBeacon when fetch was cancelled', () => {
    fetchSpy.mockImplementation(() => new Promise(() => {}));
    const transport = new BackendLogTransport();
    const event = {
      action: 'HandleSessionDisconnected',
      level: 'info' as const,
      clientSystemTime: Date.now(),
      userAgent: 'Mozilla/5.0',
      guid: 'guid-1',
    };

    transport.send(event as Parameters<BackendLogTransport['send']>[0]);
    expect(fetchSpy).toHaveBeenCalled();
    expect(sendBeaconSpy).not.toHaveBeenCalled();

    pagehideHandler();

    expect(sendBeaconSpy).toHaveBeenCalledWith(
      `${MOCK_API_URL}/internal/client-logs`,
      expect.any(Blob)
    );
    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBeGreaterThan(0);
  });
});

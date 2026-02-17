import { vi, describe, it, beforeEach, expect, type MockInstance } from 'vitest';
import { BackendLogTransport } from './index';

const MOCK_API_URL = vi.hoisted(() => 'https://api.test');

vi.mock('../../utils/constants', () => ({
  API_URL: MOCK_API_URL,
}));

vi.mock('../../utils/getAppVersion', () => ({
  default: () => 'vera-1.0.0-test',
}));

describe('BackendLogTransport', () => {
  let fetchSpy!: MockInstance<
    [input: string | URL | Request, init?: RequestInit],
    Promise<Response>
  >;
  let sendBeaconSpy!: ReturnType<typeof vi.fn>;
  let pagehideHandler!: (evt?: Event) => void;

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

  it('log() POSTs to API_URL/client-logs with JSON body and correct options', () => {
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

  it('log() does not throw when fetch rejects', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'));
    const transport = new BackendLogTransport();

    expect(() => transport.log('Test', {})).not.toThrow();

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it('removes only the correct pending entry when duplicate events serialize to same JSON', async () => {
    const resolveFns: ((res: Response) => void)[] = [];
    fetchSpy.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFns.push(resolve);
        })
    );

    const transport = new BackendLogTransport();
    const extra = { sessionId: 's', connectionId: 'c', partnerId: 'p', timestamp: 999 };
    transport.log('Duplicate', extra);
    transport.log('Duplicate', extra);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    resolveFns.forEach((resolve) => resolve({ ok: true } as Response));

    await new Promise((r) => setTimeout(r, 0));

    pagehideHandler();
    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it('pagehide flushes pending events via sendBeacon when fetch was cancelled', () => {
    fetchSpy.mockImplementation(() => new Promise(() => {}));
    const transport = new BackendLogTransport();
    transport.log('HandleSessionDisconnected', {
      sessionId: 's1',
      connectionId: 'c1',
      partnerId: 'p1',
    });

    expect(fetchSpy).toHaveBeenCalled();
    expect(sendBeaconSpy).not.toHaveBeenCalled();

    pagehideHandler();

    expect(sendBeaconSpy).toHaveBeenCalledWith(`${MOCK_API_URL}/client-logs`, expect.any(Blob));
    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBeGreaterThan(0);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import createBridgeVideoClient from './createBridgeVideoClient';

describe('createBridgeVideoClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends requests with the configured credentials mode', async () => {
    const fetchSpy = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify([{ result: { data: {} } }]), { status: 200 }))
    );
    vi.stubGlobal('fetch', fetchSpy);

    const videoClient = createBridgeVideoClient({
      entryPoint: 'https://api.example.com/v2',
      credentials: 'omit',
    });

    await videoClient.createSession({ roomName: 'room' }).catch(() => undefined);

    expect(fetchSpy).toHaveBeenCalled();
    const [, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.credentials).toEqual('omit');
  });

  it('falls back to "include" with a warning for an unknown credentials value', async () => {
    const fetchSpy = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify([{ result: { data: {} } }]), { status: 200 }))
    );
    vi.stubGlobal('fetch', fetchSpy);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const videoClient = createBridgeVideoClient({
      entryPoint: 'https://api.example.com/v2',
      credentials: 'inlcude',
    });
    await videoClient.createSession({ roomName: 'room' }).catch(() => undefined);

    const [, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.credentials).toEqual('include');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

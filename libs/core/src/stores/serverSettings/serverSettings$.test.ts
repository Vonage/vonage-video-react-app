import { createElement, useRef } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTestProvider, providers } from '@core-test/providers';
import { makeVideoClientMock } from '@core-test/fixtures';
import serverSettings$ from './serverSettings$';

const serverAheadMilliseconds = 90_000;
const sessionKey = 'meeting-session-key';

describe('serverSettings$', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes once for multiple consumers, ticks selectively, and stops on unmount', async () => {
    expect.assertions(6);
    const getServerSettings = vi.fn(() =>
      Promise.resolve({ serverTime: Date.now() + serverAheadMilliseconds })
    );
    const { wrapper, serverSettingsContext } = makeTestProvider(
      [providers.runtime, providers.serverSettings],
      {
        runtimeContext: { videoClient: makeVideoClientMock({ getServerSettings }) },
        serverSettingsContext: { sessionKey },
      }
    );
    const renderStatus = vi.fn(() => serverSettings$.useServerTimeStatus());
    const { result, unmount } = renderHook(
      () => {
        renderStatus();
        return { status: serverSettings$.useServerTimeStatus(), api: serverSettings$.use.api() };
      },
      { wrapper }
    );

    await waitForKnownTime(result.current.api);
    expect(result.current.status).toBe('known');
    expect(getServerSettings.mock.calls).toEqual([[{ sessionKey }]]);
    expect(serverSettingsContext.current.getState().now).toBe(Date.now() + serverAheadMilliseconds);
    renderStatus.mockClear();

    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(serverSettingsContext.current.getState().now).toBe(Date.now() + serverAheadMilliseconds);
    expect(renderStatus).not.toHaveBeenCalled();

    const clock = serverSettingsContext.current;
    const stoppedAt = clock.getState().now;
    unmount();
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(clock.getState().now).toBe(stoppedAt);
  });

  it('requests settings with an explicit null session key', async () => {
    expect.assertions(2);
    const getServerSettings = vi.fn(() => Promise.resolve({ serverTime: Date.now() }));
    const { wrapper } = makeTestProvider([providers.runtime, providers.serverSettings], {
      runtimeContext: { videoClient: makeVideoClientMock({ getServerSettings }) },
      serverSettingsContext: { sessionKey: null },
    });
    const { result } = renderHook(
      () => ({ status: serverSettings$.useServerTimeStatus(), api: serverSettings$.use.api() }),
      { wrapper }
    );

    await waitForKnownTime(result.current.api);
    expect(result.current.status).toBe('known');
    expect(getServerSettings.mock.calls).toEqual([[{ sessionKey: null }]]);
  });

  it('clears the previous clock while a new session request is pending without remounting consumers', async () => {
    expect.assertions(7);
    let resolveSettings!: (settings: { serverTime: number }) => void;
    const nextSettings = new Promise<{ serverTime: number }>((resolve) => {
      resolveSettings = resolve;
    });
    const getServerSettings = vi
      .fn()
      .mockResolvedValueOnce({ serverTime: Date.now() + serverAheadMilliseconds })
      .mockReturnValueOnce(nextSettings);
    const { wrapper: RuntimeWrapper } = makeTestProvider([providers.runtime], {
      runtimeContext: { videoClient: makeVideoClientMock({ getServerSettings }) },
    });
    let activeSessionKey: string | null = sessionKey;
    const { result, rerender } = renderHook(
      () => ({
        state: serverSettings$.use.select((state) => state),
        api: serverSettings$.use.api(),
        identity: useRef(null),
      }),
      {
        wrapper: ({ children }) =>
          createElement(
            RuntimeWrapper,
            null,
            createElement(serverSettings$.Provider, { sessionKey: activeSessionKey }, children)
          ),
      }
    );

    await waitForKnownTime(result.current.api);
    expect(result.current.state.status).toBe('known');
    const identity = result.current.identity;
    activeSessionKey = 'another-session-key';
    rerender();
    expect(result.current.state.status).toBe('pending');
    expect(result.current.state.now).toBeNull();
    expect(result.current.identity).toBe(identity);
    expect(getServerSettings).toHaveBeenLastCalledWith({ sessionKey: activeSessionKey });

    await act(() => {
      resolveSettings({ serverTime: Date.now() });
      return nextSettings;
    });
    await waitForKnownTime(result.current.api);
    expect(result.current.state.status).toBe('known');
    expect(result.current.state.clockOffset).toBe(0);
  });
});

async function waitForKnownTime(api: ReturnType<typeof serverSettings$.use.api>) {
  const status = api.createObservable((state) => state.status);
  const ready = new Promise<void>((resolve) => {
    status.subscribe((value) => {
      if (value === 'known') resolve();
    });
  });
  await act(() => ready);
  status.dispose();
}

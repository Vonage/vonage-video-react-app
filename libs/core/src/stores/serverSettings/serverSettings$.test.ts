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

  it('keeps the server time empty until the server answers', () => {
    expect.assertions(2);

    const { wrapper, serverSettingsContext } = makeTestProvider([providers.serverSettings]);

    renderHook(() => serverSettings$.useServerTimeStatus(), { wrapper });

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(serverSettingsContext.current.getState().status).toBe('pending');
    expect(serverSettingsContext.current.getState().now).toBeNull();
  });

  it('ticks the server time without re-rendering a consumer that selects only the status', () => {
    expect.assertions(2);

    const { wrapper, serverSettingsContext } = makeTestProvider([providers.serverSettings], {
      serverSettingsContext: { value: { status: 'known', now: Date.now(), clockOffset: 0 } },
    });
    const renderStatus = vi.fn(() => serverSettings$.useServerTimeStatus());

    renderHook(renderStatus, { wrapper });
    const startedAt = serverSettingsContext.current.getState().now;

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(serverSettingsContext.current.getState().now).toBe(startedAt + 5_000);
    expect(renderStatus).toHaveBeenCalledTimes(1);
  });

  it('stops the server clock when the provider unmounts', () => {
    expect.assertions(2);
    const { wrapper } = makeTestProvider([providers.serverSettings]);

    const { unmount } = renderHook(() => serverSettings$.useServerTimeStatus(), { wrapper });

    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it('sends the sessionKey and moves the observed server time to the answer without waiting for a tick', async () => {
    expect.assertions(2);

    const getServerSettings = vi.fn(() =>
      Promise.resolve({ serverTime: Date.now() + serverAheadMilliseconds })
    );
    const { wrapper } = makeTestProvider([providers.runtime, providers.serverSettings], {
      runtimeContext: { videoClient: makeVideoClientMock({ getServerSettings }) },
    });

    const { result } = renderHook(
      () => {
        serverSettings$.useServerSettings({ sessionKey });

        return serverSettings$.use.observable((state) => state.now);
      },
      { wrapper }
    );

    const nextServerNow = new Promise<number | null>((resolve) => {
      result.current.subscribe(resolve, { skipFirst: true });
    });

    const serverNow = await act(() => nextServerNow);

    expect(getServerSettings).toHaveBeenCalledWith({ sessionKey });
    expect(serverNow).toBe(Date.now() + serverAheadMilliseconds);
  });
});

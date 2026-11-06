import { renderHook as renderHookBase, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeTestProvider, providers, type ProviderOptions } from '@core-test/providers';
import { makeVideoClientMock } from '@core-test/fixtures';
import useServerSettings from './useServerSettings';

const serverAheadMilliseconds = 90_000;
const sessionKey = 'meeting-session-key';

describe('useServerSettings', () => {
  it('exposes a clock offset that aligns the local clock with the server time', async () => {
    expect.assertions(1);

    const videoClient = makeVideoClientMock({
      getServerSettings: () =>
        Promise.resolve({
          serverTime: Date.now() + serverAheadMilliseconds,
          extension: { options: [20, 40, 60] },
        }),
    });

    const { result } = renderHook(() => useServerSettings({ sessionKey }), {
      runtimeContext: { videoClient },
    });

    await waitFor(() => {
      if (!result.current.data) throw new Error('No data');
    });

    const serverNow = Date.now() + result.current.data!.clockOffset;

    expect(Math.abs(serverNow - (Date.now() + serverAheadMilliseconds))).toBeLessThan(1_000);
  });

  it('sends the meeting sessionKey with the request', async () => {
    expect.assertions(1);

    const getServerSettings = vi.fn(() => Promise.resolve({ serverTime: Date.now() }));
    const videoClient = makeVideoClientMock({ getServerSettings });

    renderHook(() => useServerSettings({ sessionKey }), { runtimeContext: { videoClient } });

    await waitFor(() => {
      if (getServerSettings.mock.calls.length === 0) throw new Error('Not called');
    });

    expect(getServerSettings).toHaveBeenCalledWith({ sessionKey });
  });
});

type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function renderHook<Result>(render: () => Result, { runtimeContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime], {
    runtimeContext,
  });

  return {
    ...context,
    ...renderHookBase(render, {
      wrapper,
    }),
  };
}

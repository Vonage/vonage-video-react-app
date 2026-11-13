import { act, renderHook as renderHookBase } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { makeTestProvider, providers, type ProviderOptions } from '@core-test/providers';
import useScheduleStatus from './useScheduleStatus';

const startsAt = new Date(2026, 10, 4, 9, 30).getTime();
const scheduleWindow = { startsAtMs: startsAt, endsAtMs: startsAt + 60 * 60_000 };
const serverBehindMilliseconds = 2 * 60_000;

describe('useScheduleStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays pending while the server is unavailable and switches once it answers', async () => {
    expect.assertions(2);

    vi.setSystemTime(startsAt + 60_000);

    const getServerSettings = vi
      .fn()
      .mockRejectedValueOnce(new Error('Unauthorized'))
      .mockImplementation(() =>
        Promise.resolve({ serverTime: Date.now() - serverBehindMilliseconds })
      );

    const videoClient = makeVideoClientMock({ getServerSettings });

    const { result } = renderHook(
      () => useScheduleStatus({ sessionKey: 'scheduled-session-key', scheduleWindow }),
      { runtimeContext: { videoClient } }
    );

    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(result.current.kind).toBe('pending');

    await act(() => vi.advanceTimersByTimeAsync(10_001));

    expect(result.current.kind).toBe('withinFiveMinutes');
  });

  it('stays pending and never ended while the server has not answered', async () => {
    expect.assertions(1);

    vi.setSystemTime(scheduleWindow.endsAtMs + 60_000);

    const getServerSettings = vi.fn(() => new Promise<never>(() => {}));
    const videoClient = makeVideoClientMock({ getServerSettings });

    const { result } = renderHook(
      () => useScheduleStatus({ sessionKey: 'scheduled-session-key', scheduleWindow }),
      { runtimeContext: { videoClient } }
    );

    await act(() => vi.advanceTimersByTimeAsync(5_000));

    expect(result.current.kind).toBe('pending');
  });
});

type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function renderHook<Result>(render: () => Result, { runtimeContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime, providers.serverSettings], {
    runtimeContext,
    serverSettingsContext: undefined,
  });

  return {
    ...context,
    ...renderHookBase(render, {
      wrapper,
    }),
  };
}

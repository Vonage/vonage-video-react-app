import { act, renderHook as renderHookBase, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { makeTestProvider, providers, type ProviderOptions } from '@core-test/providers';
import { makeVideoClientMock } from '@core-test/fixtures';
import serverSettings$ from './serverSettings$';

const serverAheadMilliseconds = 90_000;
const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';

describe('serverSettings$', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([jwt.sign({ sessionId }, 'test'), null])(
    'initializes and ticks the clock without rerendering status, then cleans up for key %s',
    async function checkServerClockLifecycle(sessionKey) {
      expect.assertions(5);

      const getServerSettings = vi.fn(function answerWithServerTime() {
        return Promise.resolve({ serverTime: Date.now() + serverAheadMilliseconds });
      });
      const renderStatus = vi.fn(serverSettings$.useServerTimeStatus);
      const { unmount, serverSettingsContext } = renderHook(renderStatus, {
        runtimeContext: { videoClient: makeVideoClientMock({ getServerSettings }) },
        serverSettingsContext: { sessionKey },
      });
      const { promise: serverTimeReady, resolve: resolveServerTime } =
        Promise.withResolvers<void>();
      const unsubscribe = serverSettingsContext.current.subscribe(
        (state) => state.status,
        function resolveKnownServerTime(status) {
          if (status === 'known') resolveServerTime();
        }
      );
      await act(function waitForServerTime() {
        return serverTimeReady;
      });
      unsubscribe();

      expect(getServerSettings).toHaveBeenCalledWith({ sessionKey });
      expect(serverSettingsContext.current.getState().now).toBe(
        Date.now() + serverAheadMilliseconds
      );
      renderStatus.mockClear();

      act(function advanceServerClock() {
        vi.advanceTimersByTime(5_000);
      });

      expect(serverSettingsContext.current.getState().now).toBe(
        Date.now() + serverAheadMilliseconds
      );
      expect(renderStatus).not.toHaveBeenCalled();
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it('updates timing when the provider key changes and decodes only once per key', async () => {
    expect.assertions(6);

    const now = Date.now();
    const schedule = { startsAtMs: now - 60_000, endsAtMs: now + 60_000 };
    const sessionKey = jwt.sign({ sessionId, schedule }, 'test');
    const extendedSessionKey = jwt.sign(
      { sessionId, schedule: { ...schedule, endsAtMs: now + 120_000 } },
      'test'
    );
    const decodeBase64 = vi.spyOn(globalThis, 'atob');
    const { wrapper } = makeTestProvider([providers.runtime], {
      runtimeContext: {
        videoClient: makeVideoClientMock({
          getServerSettings: () => Promise.resolve({ serverTime: Date.now() }),
        }),
      },
    });
    const { rerender } = render(
      <serverSettings$.Provider sessionKey={sessionKey}>
        <ScheduleReadout />
      </serverSettings$.Provider>,
      { wrapper }
    );

    expect(await screen.findByText('started:60')).toBeInTheDocument();
    expect(decodeBase64).toHaveBeenCalledTimes(2);

    rerender(
      <serverSettings$.Provider sessionKey={sessionKey}>
        <ScheduleReadout />
      </serverSettings$.Provider>
    );
    expect(decodeBase64).toHaveBeenCalledTimes(2);

    rerender(
      <serverSettings$.Provider sessionKey={extendedSessionKey}>
        <ScheduleReadout />
      </serverSettings$.Provider>
    );
    expect(await screen.findByText('started:120')).toBeInTheDocument();
    expect(decodeBase64).toHaveBeenCalledTimes(4);

    rerender(
      <serverSettings$.Provider sessionKey={null}>
        <ScheduleReadout />
      </serverSettings$.Provider>
    );
    expect(await screen.findByText('unscheduled:')).toBeInTheDocument();
  });
});

type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
  serverSettingsContext?: ProviderOptions['ServerSettingsContext'];
};

function renderHook<Result>(
  callback: () => Result,
  { runtimeContext, serverSettingsContext = { sessionKey: null } }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime, providers.serverSettings], {
    runtimeContext: {
      videoClient: makeVideoClientMock({
        getServerSettings: () => Promise.resolve({ serverTime: Date.now() }),
      }),
      ...runtimeContext,
    },
    serverSettingsContext,
  });

  return { ...context, ...renderHookBase(callback, { wrapper }) };
}

function ScheduleReadout() {
  const scheduleStatus = serverSettings$.useScheduleStatus();
  const secondsUntilEnd = serverSettings$.useSecondsUntilEnd();

  return (
    <output>
      {scheduleStatus.kind}:{secondsUntilEnd}
    </output>
  );
}

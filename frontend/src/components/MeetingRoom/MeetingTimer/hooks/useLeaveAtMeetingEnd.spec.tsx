import { act, renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import { SessionKeyClaim } from '@common/constants';
import { makeTestProvider, providers } from '@test/providers';
import composeProviders from '@web/helpers/composeProviders';
import { serverSettings$ } from '@core/stores';
import { coreQueryKeys } from '@core/constants';
import useLeaveAtMeetingEnd from './useLeaveAtMeetingEnd';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
const startsAt = new Date(2026, 10, 4, 10, 0).getTime();
const endsAt = startsAt + 60 * 60_000;
const serverAheadMilliseconds = 60_000;
const storeTickMilliseconds = 1_000;

describe('useLeaveAtMeetingEnd', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({ mediaDevices: { enumerateDevices: Promise.resolve([]) } });
    vi.spyOn(navigator.permissions, 'query').mockResolvedValue({
      state: 'granted',
    } as PermissionStatus);
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('leaves the meeting at its end by server time and not before', async () => {
    expect.assertions(5);

    vi.setSystemTime(endsAt - serverAheadMilliseconds - 3_000);

    const sessionKey = makeSessionKey({
      sessionId,
      [SessionKeyClaim.schedule]: { startsAtMs: startsAt, endsAtMs: endsAt },
    });
    const { sessionContext, backgroundPublisherContext, queryClient } = render({ sessionKey });

    await act(async () => {
      await vi.waitFor(() => {
        const serverSettings = queryClient.getQueryData(
          coreQueryKeys.serverSettings({ sessionKey })
        );
        if (!serverSettings) throw new Error('The server time has not arrived');
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await act(() => vi.advanceTimersByTimeAsync(2_000));

    expect(sessionContext.current.disconnect).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    const millisecondsUntilTickAfterMeetingEnd =
      endsAt - serverAheadMilliseconds - Date.now() + storeTickMilliseconds;
    await act(() => vi.advanceTimersByTimeAsync(millisecondsUntilTickAfterMeetingEnd));

    expect(sessionContext.current.disconnect).toHaveBeenCalledOnce();
    expect(backgroundPublisherContext.current.destroyBackgroundPublisher).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith(`/goodbye/${sessionKey}`, {
      state: { header: 'This meeting has ended' },
    });
  });

  it('never leaves an unscheduled meeting', async () => {
    expect.assertions(2);

    vi.setSystemTime(endsAt);

    const { sessionContext } = render({ sessionKey: makeSessionKey({ sessionId }) });

    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    await act(() => vi.advanceTimersByTimeAsync(3 * 60 * 60_000));

    expect(sessionContext.current.disconnect).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

function makeSessionKey(payload: Record<string, unknown>): string {
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=+$/, '');
  return `eyJhbGciOiJIUzI1NiJ9.${encodedPayload}.signature`;
}

function render({ sessionKey }: { sessionKey: string }) {
  const queryClient = new QueryClient();
  const { wrapper, sessionContext, backgroundPublisherContext } = makeTestProvider(
    [
      providers.runtime,
      providers.user,
      providers.session,
      providers.publisher,
      providers.backgroundPublisher,
      providers.miniMode,
    ],
    {
      runtimeContext: {
        queryClient,
        videoClient: makeVideoClientMock({
          getServerSettings: () =>
            Promise.resolve({ serverTime: Date.now() + serverAheadMilliseconds }),
        }),
      },
      userContext: undefined,
      sessionContext: {
        initialValue: { sessionKey },
        __onCreated: (context) => {
          context.disconnect = vi.fn();
        },
      },
      publisherContext: undefined,
      backgroundPublisherContext: {
        __onCreated: (context) => {
          context.destroyBackgroundPublisher = vi.fn();
        },
      },
      miniModeContext: undefined,
    }
  );

  renderHook(() => useLeaveAtMeetingEnd(), {
    wrapper: composeProviders(wrapper, serverSettings$.Provider),
  });

  return { sessionContext, backgroundPublisherContext, queryClient };
}

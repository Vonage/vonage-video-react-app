import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { notifications$ } from '@core/stores';
import { QueryClient } from '@tanstack/react-query';
import { coreQueryKeys } from '@core/constants';
import { SessionKeyClaim } from '@common/constants';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import i18n from '../../../../i18n';
import useEndOfMeetingWarning from './useEndOfMeetingWarning';

const endsAtMs = new Date('2026-11-13T12:00:00Z').getTime();

describe('useEndOfMeetingWarning', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(endsAtMs - 6 * 60_000);
  });

  afterEach(async () => {
    vi.useRealTimers();
    await i18n.changeLanguage('en');
  });

  it('warns at five minutes, does not repeat on language changes, and dismisses on room exit', async () => {
    expect.assertions(4);
    const payload = {
      sessionId: '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE',
      [SessionKeyClaim.schedule]: { startsAtMs: endsAtMs - 60 * 60_000, endsAtMs },
    };
    const sessionKey = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.signature`;
    const push = vi.spyOn(notifications$.actions, 'push');
    const dismiss = vi.spyOn(notifications$.actions, 'dismiss');
    const { unmount, rerender } = renderHook(useEndOfMeetingWarning, { sessionKey });

    await act(() => vi.advanceTimersByTimeAsync(1_000));
    expect(push).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    await act(() => i18n.changeLanguage('es'));
    rerender();
    expect(push).toHaveBeenCalledTimes(1);
    unmount();
    expect(dismiss).toHaveBeenCalledWith(push.mock.results[0].value);
  });

  it('warns immediately inside the warning window and stays silent after the end', () => {
    expect.assertions(3);

    vi.setSystemTime(endsAtMs - 60_000);
    const sessionKey = `eyJhbGciOiJIUzI1NiJ9.${btoa(
      JSON.stringify({
        sessionId: '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE',
        [SessionKeyClaim.schedule]: { startsAtMs: endsAtMs - 60 * 60_000, endsAtMs },
      })
    ).replace(/=+$/, '')}.signature`;
    const queryClient = new QueryClient();
    queryClient.setQueryData(coreQueryKeys.serverSettings({ sessionKey }), {
      serverTime: Date.now(),
      clockOffset: 0,
    });
    const push = vi.spyOn(notifications$.actions, 'push');
    const dismiss = vi.spyOn(notifications$.actions, 'dismiss');
    const { unmount } = renderHook(useEndOfMeetingWarning, {
      sessionKey,
      runtimeContext: { queryClient },
    });

    expect(push).toHaveBeenCalledOnce();
    unmount();
    expect(dismiss).toHaveBeenCalledWith(push.mock.results[0].value);

    vi.setSystemTime(endsAtMs);
    renderHook(useEndOfMeetingWarning, { sessionKey, runtimeContext: { queryClient } });
    expect(push).toHaveBeenCalledOnce();
  });
});

type RenderOptions = {
  sessionKey: string;
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function renderHook(callback: () => void, { sessionKey, runtimeContext }: RenderOptions) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime, providers.serverSettings], {
    serverSettingsContext: { sessionKey },
    runtimeContext: {
      videoClient: makeVideoClientMock({
        getServerSettings: () => Promise.resolve({ serverTime: Date.now() }),
      }),
      ...runtimeContext,
    },
  });

  return { ...context, ...renderHookBase(callback, { wrapper }) };
}

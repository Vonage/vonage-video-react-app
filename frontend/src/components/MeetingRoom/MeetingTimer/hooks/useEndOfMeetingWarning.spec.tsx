import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { notifications$ } from '@core/stores';
import { SessionKeyClaim } from '@common/constants';
import { makeTestProvider, providers } from '@test/providers';
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
    const { wrapper } = makeTestProvider(
      [providers.runtime, providers.user, providers.session, providers.serverSettings],
      {
        serverSettingsContext: { sessionKey },
        runtimeContext: {
          videoClient: makeVideoClientMock({
            getServerSettings: () => Promise.resolve({ serverTime: Date.now() }),
          }),
        },
        userContext: undefined,
        sessionContext: { initialValue: { sessionKey } },
      }
    );
    const push = vi.spyOn(notifications$.actions, 'push');
    const dismiss = vi.spyOn(notifications$.actions, 'dismiss');
    const { unmount, rerender } = renderHook(
      () => {
        useEndOfMeetingWarning();
      },
      { wrapper }
    );

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
});

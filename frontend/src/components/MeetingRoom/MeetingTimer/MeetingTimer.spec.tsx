import type { ReactElement } from 'react';
import {
  act,
  fireEvent,
  render as renderBase,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { notifications$ } from '@core/stores';
import { SessionKeyClaim } from '@common/constants';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import { env } from '../../../env';
import MeetingTimer from './MeetingTimer';

const endsAt = new Date(2026, 10, 4, 11, 0).getTime();
const scheduleWindow = { startsAtMs: endsAt - 2 * 60 * 60_000, endsAtMs: endsAt };
const serverAheadMilliseconds = 60_000;
const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
const signedInHintCookie = 'vera-session-signed-in';

describe('MeetingTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    env.partialUpdate({ AUTH_ENABLED: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    env.reset();
    document.cookie = `${signedInHintCookie}=; max-age=0`;
  });

  it('counts down the time left by server time with labelled minutes and seconds', async () => {
    expect.assertions(2);

    vi.setSystemTime(endsAt - serverAheadMilliseconds - (4 * 60_000 + 52_000));

    render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
      runtimeContext: { videoClient: makeServerClockAhead() },
    });

    expect(await screen.findByText('4 min 52 sec left')).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(4 * 60_000 + 7_000));

    expect(screen.getByRole('timer')).toHaveTextContent('45 sec left');
  });

  describe('signed in', () => {
    beforeEach(() => {
      document.cookie = `${signedInHintCookie}=1`;
    });

    it('shows the meeting ending dialog instead of the message, and Got it closes it', async () => {
      expect.assertions(3);
      vi.setSystemTime(endsAt - serverAheadMilliseconds - 5 * 60_000);
      const pushSpy = vi.spyOn(notifications$.actions, 'push');

      render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
        runtimeContext: { videoClient: makeServerClockAhead() },
        sessionKey: makeSessionKey({ extendedMinutes: 0 }),
      });

      const dialog = await screen.findByRole('dialog', { name: 'Meeting ending' });

      expect(within(dialog).getByText('The current meeting is about to end.')).toBeInTheDocument();
      expect(pushSpy).not.toHaveBeenCalled();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Got it' }));
      await waitForElementToBeRemoved(dialog);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('extends by the chosen minutes, with choices past the cap disabled', async () => {
      expect.assertions(4);
      vi.setSystemTime(endsAt - serverAheadMilliseconds - 5 * 60_000);
      const sessionKey = makeSessionKey({ extendedMinutes: 80 });
      const videoClient = makeServerClockAhead();

      render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
        runtimeContext: { videoClient },
        sessionKey,
      });

      const dialog = await screen.findByRole('dialog', { name: 'Meeting ending' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Extend' }));

      expect(screen.getByRole('dialog', { name: 'How long do you want to extend?' })).toBeVisible();
      expect(screen.getByRole('button', { name: '60 min' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: '20 min' }));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      expect(videoClient.extendSession).toHaveBeenCalledWith({ sessionKey, minutes: 20 });
    });

    it('only says the meeting cannot be extended further at the cap', async () => {
      expect.assertions(2);
      vi.setSystemTime(endsAt - serverAheadMilliseconds - 4 * 60_000);

      render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
        runtimeContext: { videoClient: makeServerClockAhead() },
        sessionKey: makeSessionKey({ extendedMinutes: 120 }),
      });

      const dialog = await screen.findByRole('dialog', { name: 'Meeting ending' });

      expect(
        await within(dialog).findByText(/This meeting cannot be extended further\./)
      ).toBeInTheDocument();
      expect(
        within(dialog)
          .getAllByRole('button')
          .map(({ textContent }) => textContent)
      ).toEqual(['Got it']);
    });
  });
});

function makeSessionKey({ extendedMinutes }: { extendedMinutes: number }): string {
  const payload = {
    sessionId,
    [SessionKeyClaim.schedule]: scheduleWindow,
    [SessionKeyClaim.extended]: extendedMinutes,
  };
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=+$/, '');
  return `eyJhbGciOiJIUzI1NiJ9.${encodedPayload}.signature`;
}

function makeServerClockAhead() {
  return makeVideoClientMock({
    getServerSettings: () =>
      Promise.resolve({
        serverTime: Date.now() + serverAheadMilliseconds,
        extension: { options: [20, 40, 60] },
      }),
    extendSession: () => new Promise(() => {}),
  });
}

type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
  sessionKey?: string;
};

function render(ui: ReactElement, { runtimeContext, sessionKey }: RenderOptions) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.runtime, providers.user, providers.session, providers.serverSettings],
    { runtimeContext, userContext: undefined, sessionContext: { initialValue: { sessionKey } }, serverSettingsContext: { sessionKey: sessionKey ?? null } }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

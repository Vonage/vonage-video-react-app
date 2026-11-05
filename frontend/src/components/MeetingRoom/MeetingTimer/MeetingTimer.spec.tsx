import type { ReactElement } from 'react';
import { act, fireEvent, render as renderBase, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { notifications$ } from '@core/stores';
import { SessionKeyClaim } from '@common/constants';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import MeetingTimer from './MeetingTimer';

const endsAt = new Date(2026, 10, 4, 11, 0).getTime();
const scheduleWindow = { startsAt: endsAt - 2 * 60 * 60_000, endsAt };
const serverAheadMilliseconds = 60_000;
const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';

describe('MeetingTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('shows the about-to-finish message once', async () => {
    expect.assertions(2);

    vi.setSystemTime(endsAt - serverAheadMilliseconds - 5 * 60_000);
    const pushSpy = vi.spyOn(notifications$.actions, 'push');

    render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
      runtimeContext: { videoClient: makeServerClockAhead() },
    });

    await act(() => vi.advanceTimersByTimeAsync(3 * 60_000));

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'warning', message: 'The meeting is about to finish' })
    );
  });

  it('dismisses the about-to-finish message when the meeting room closes', () => {
    vi.setSystemTime(endsAt - 60_000);
    const { unmount } = render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
      runtimeContext: { videoClient: makeServerClockAhead() },
    });
    const hasEndingSoonNotification = () =>
      [...notifications$.getState().notifications.values()].some(
        ({ message }) => message === 'The meeting is about to finish'
      );

    expect(hasEndingSoonNotification()).toBe(true);
    unmount();
    expect(hasEndingSoonNotification()).toBe(false);
  });

  it('shows the about-to-finish message again for the new end of an extended meeting', async () => {
    expect.assertions(3);

    vi.setSystemTime(endsAt - serverAheadMilliseconds - 5 * 60_000);
    const pushSpy = vi.spyOn(notifications$.actions, 'push');

    const { rerender } = render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
      runtimeContext: { videoClient: makeServerClockAhead() },
    });

    expect(await screen.findByText('5 min left')).toBeInTheDocument();
    expect(pushSpy).toHaveBeenCalledTimes(1);

    rerender(<MeetingTimer scheduleWindow={{ ...scheduleWindow, endsAt: endsAt + 20 * 60_000 }} />);
    await act(() => vi.advanceTimersByTimeAsync(20 * 60_000));

    expect(pushSpy).toHaveBeenCalledTimes(2);
  });

  it('opens the extend popover by itself, with options past the limit disabled', async () => {
    expect.assertions(5);
    vi.setSystemTime(endsAt - serverAheadMilliseconds - 5 * 60_000);

    render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
      runtimeContext: { videoClient: makeServerClockAhead() },
      sessionKey: makeSessionKey({ extendedMinutes: 80 }),
    });

    expect(await screen.findByText('5 min left')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Extend meeting' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /\+20 min/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /\+60 min Over the 120 min limit/ })).toBeDisabled();
    expect(screen.getByText('Extended by 80 of 120 min')).toBeInTheDocument();
  });

  it('closes the extend popover once the scheduled end has passed', async () => {
    expect.assertions(3);
    vi.setSystemTime(endsAt - serverAheadMilliseconds - 2_000);

    render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
      runtimeContext: { videoClient: makeServerClockAhead() },
      sessionKey: makeSessionKey({ extendedMinutes: 0 }),
    });

    expect(await screen.findByText('2 sec left')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Extend meeting' })).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(3_000));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open by itself at the extension limit, and opens on demand to say so', async () => {
    expect.assertions(3);
    vi.setSystemTime(endsAt - serverAheadMilliseconds - 4 * 60_000);

    render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
      runtimeContext: { videoClient: makeServerClockAhead() },
      sessionKey: makeSessionKey({ extendedMinutes: 120 }),
    });

    expect(await screen.findByText('4 min left')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(getTimerButton());

    expect(screen.getByRole('note')).toHaveTextContent(
      'This meeting reached its 120 min extension limit'
    );
  });
});

function getTimerButton() {
  return screen.getByRole('button', { name: / left$/ });
}

function makeSessionKey({ extendedMinutes }: { extendedMinutes: number }): string {
  const payload = {
    sessionId,
    [SessionKeyClaim.schedule]: { at: scheduleWindow.startsAt / 1000, min: 120 },
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
  });
}

type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
  sessionKey?: string;
};

function render(ui: ReactElement, { runtimeContext, sessionKey }: RenderOptions) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.runtime, providers.user, providers.session],
    { runtimeContext, userContext: undefined, sessionContext: { initialValue: { sessionKey } } }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

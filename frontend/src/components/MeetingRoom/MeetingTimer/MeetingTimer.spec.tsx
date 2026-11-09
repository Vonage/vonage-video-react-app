import type { ReactElement } from 'react';
import { act, render as renderBase, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { notifications$ } from '@core/stores';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import MeetingTimer from './MeetingTimer';

const endsAt = new Date(2026, 10, 4, 11, 0).getTime();
const scheduleWindow = { startsAtMs: endsAt - 2 * 60 * 60_000, endsAtMs: endsAt };
const serverAheadMilliseconds = 60_000;

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
});

function makeServerClockAhead() {
  return makeVideoClientMock({
    getServerSettings: () => Promise.resolve({ serverTime: Date.now() + serverAheadMilliseconds }),
  });
}

type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function render(ui: ReactElement, { runtimeContext }: RenderOptions) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime], { runtimeContext });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

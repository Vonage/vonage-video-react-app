import type { ReactElement } from 'react';
import { act, render as renderBase, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { notifications$ } from '@core/stores';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import MeetingTimer from './MeetingTimer';

const endsAt = new Date(2026, 10, 4, 11, 0).getTime();
const scheduleWindow = { startsAt: endsAt - 2 * 60 * 60_000, endsAt };
const serverAheadMilliseconds = 60_000;

describe('MeetingTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down the time left by server time and turns amber in the last five minutes', async () => {
    expect.assertions(5);

    vi.setSystemTime(endsAt - serverAheadMilliseconds - (60 * 60_000 + 30_000));

    render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
      runtimeContext: { videoClient: makeServerClockAhead() },
    });

    expect(await screen.findByText('1 h 0 min left')).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(50 * 60_000));

    expect(screen.getByRole('timer')).toHaveTextContent('10 min left');

    await act(() => vi.advanceTimersByTimeAsync(5 * 60_000 + 29_000));

    expect(screen.getByRole('timer')).toHaveTextContent('5:01 left');
    expect(screen.getByRole('timer')).not.toHaveClass('bg-vera-warning');

    await act(() => vi.advanceTimersByTimeAsync(1_000));

    expect(screen.getByRole('timer')).toHaveClass('bg-vera-warning');
  });

  it('shows the about-to-finish message once, five minutes before the end', async () => {
    expect.assertions(4);

    vi.setSystemTime(endsAt - serverAheadMilliseconds - 5 * 60_000 - 2_000);
    const pushSpy = vi.spyOn(notifications$.actions, 'push');

    render(<MeetingTimer scheduleWindow={scheduleWindow} />, {
      runtimeContext: { videoClient: makeServerClockAhead() },
    });

    expect(await screen.findByText('5:02 left')).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(1_000));

    expect(pushSpy).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(3 * 60_000));

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'warning', message: 'The meeting is about to finish' })
    );
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

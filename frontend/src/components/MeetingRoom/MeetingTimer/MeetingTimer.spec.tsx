import type { ReactElement } from 'react';
import { act, render as renderBase, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
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
});

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
};

function render(ui: ReactElement, { runtimeContext }: RenderOptions) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime, providers.serverSettings], {
    serverSettingsContext: { sessionKey: null },
    runtimeContext,
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

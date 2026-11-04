import type { ReactElement } from 'react';
import { act, fireEvent, render as renderBase, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { makeVideoClientMock } from '@core-test/fixtures';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import composeProviders from '@web/helpers/composeProviders';
import { serverSettings$ } from '@core/stores';
import UsernameInput from './UserNameInput';

const startsAt = new Date(2026, 10, 4, 9, 30).getTime();
const serverAheadMilliseconds = 60_000;

describe('UsernameInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the name field editable, enables Join at the start by server time and joins with the sessionKey', async () => {
    expect.assertions(7);

    vi.setSystemTime(startsAt - serverAheadMilliseconds - 65_000);

    const videoClient = makeVideoClientMock({
      getServerSettings: () =>
        Promise.resolve({ serverTime: Date.now() + serverAheadMilliseconds }),
    });

    render(
      <UsernameInput
        username="Ana"
        setUsername={vi.fn()}
        roomName={undefined}
        sessionKey="scheduled-session-key"
        scheduleWindow={{ startsAtMs: startsAt, endsAtMs: startsAt + 60 * 60_000 }}
      />,
      { runtimeContext: { videoClient } }
    );

    expect(await screen.findByText('Join opens in 1 min 5 sec')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join meeting' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Your name' })).toBeEnabled();

    for (let elapsedSeconds = 0; elapsedSeconds < 60; elapsedSeconds += 1) {
      await act(() => vi.advanceTimersByTimeAsync(1_000));
    }

    expect(screen.getByText('Join opens in 5 sec')).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(5_000));

    expect(screen.getByText('The meeting has started')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join meeting' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Join meeting' }));

    expect(screen.getByTestId('room-scheduled-session-key')).toBeInTheDocument();
  });

  it('keeps Join disabled past the start by the local clock until the server time is known', () => {
    vi.setSystemTime(startsAt + 5 * 60_000);

    const videoClient = makeVideoClientMock({
      getServerSettings: () => new Promise(() => {}),
    });

    render(
      <UsernameInput
        username="Ana"
        setUsername={vi.fn()}
        roomName={undefined}
        sessionKey="scheduled-session-key"
        scheduleWindow={{ startsAtMs: startsAt, endsAtMs: startsAt + 60 * 60_000 }}
      />,
      { runtimeContext: { videoClient } }
    );

    expect(screen.queryByText('The meeting has started')).not.toBeInTheDocument();
    expect(screen.getByTestId('schedule-countdown-panel-skeleton')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join meeting' })).toBeDisabled();
  });

  it('titles an unscheduled card with the room name and joins by room name', () => {
    render(
      <UsernameInput
        username="Ana"
        setUsername={vi.fn()}
        roomName="design-review"
        sessionKey="design-review"
        scheduleWindow={null}
      />
    );

    expect(screen.getByRole('heading', { name: 'design-review' })).toBeInTheDocument();
    expect(screen.queryByTestId('schedule-countdown-panel')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Join meeting' }));

    expect(screen.getByTestId('room-design-review')).toBeInTheDocument();
  });

  it('joins at the start by server time without pressing Join when auto-join is ticked', async () => {
    expect.assertions(3);

    vi.setSystemTime(startsAt - serverAheadMilliseconds - 5_000);

    const videoClient = makeVideoClientMock({
      getServerSettings: () =>
        Promise.resolve({ serverTime: Date.now() + serverAheadMilliseconds }),
    });

    render(
      <UsernameInput
        username="Ana"
        setUsername={vi.fn()}
        roomName={undefined}
        sessionKey="scheduled-session-key"
        scheduleWindow={{ startsAt, endsAt: startsAt + 60 * 60_000 }}
      />,
      { runtimeContext: { videoClient } }
    );

    expect(await screen.findByText('Join opens in 0:05')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Join automatically when it starts' }));

    await act(() => vi.advanceTimersByTimeAsync(4_000));

    expect(screen.queryByTestId('room-scheduled-session-key')).not.toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(1_000));

    expect(screen.getByTestId('room-scheduled-session-key')).toBeInTheDocument();
  });

  it('stays in the waiting room at the start when auto-join is not ticked', async () => {
    expect.assertions(3);

    vi.setSystemTime(startsAt - serverAheadMilliseconds - 5_000);

    const videoClient = makeVideoClientMock({
      getServerSettings: () =>
        Promise.resolve({ serverTime: Date.now() + serverAheadMilliseconds }),
    });

    render(
      <UsernameInput
        username="Ana"
        setUsername={vi.fn()}
        roomName={undefined}
        sessionKey="scheduled-session-key"
        scheduleWindow={{ startsAt, endsAt: startsAt + 60 * 60_000 }}
      />,
      { runtimeContext: { videoClient } }
    );

    expect(
      await screen.findByRole('checkbox', { name: 'Join automatically when it starts' })
    ).not.toBeChecked();

    await act(() => vi.advanceTimersByTimeAsync(5_000));

    expect(screen.getByRole('button', { name: 'Join meeting' })).toBeEnabled();
    expect(screen.queryByTestId('room-scheduled-session-key')).not.toBeInTheDocument();
  });

  it('disables auto-join until a name is entered', () => {
    vi.setSystemTime(startsAt - 60 * 60_000);

    render(
      <UsernameInput
        username=""
        setUsername={vi.fn()}
        roomName={undefined}
        sessionKey="scheduled-session-key"
        scheduleWindow={{ startsAt, endsAt: startsAt + 60 * 60_000 }}
      />
    );

    expect(
      screen.getByRole('checkbox', { name: 'Join automatically when it starts' })
    ).toBeDisabled();
    expect(screen.getByText('Enter your name to turn this on')).toBeInTheDocument();
  });

  it('hides Join and keeps its children once the meeting has ended', async () => {
    vi.setSystemTime(startsAt + 2 * 60 * 60_000);

    const videoClient = makeVideoClientMock({
      getServerSettings: () => Promise.resolve({ serverTime: Date.now() }),
    });

    render(
      <UsernameInput
        username="Ana"
        setUsername={vi.fn()}
        roomName={undefined}
        sessionKey="scheduled-session-key"
        scheduleWindow={{ startsAtMs: startsAt, endsAtMs: startsAt + 60 * 60_000 }}
      >
        <button type="button">Back to landing</button>
      </UsernameInput>,
      { runtimeContext: { videoClient } }
    );

    expect(await screen.findByText('This meeting has ended')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to landing' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Join meeting' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Your name' })).toBeDisabled();
  });

  it('shows no title and joins with the sessionKey when the key carries no room name', () => {
    render(
      <UsernameInput
        username="Ana"
        setUsername={vi.fn()}
        roomName={undefined}
        sessionKey="unnamed-session-key"
        scheduleWindow={null}
      />
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Join meeting' }));

    expect(screen.getByTestId('room-unnamed-session-key')).toBeInTheDocument();
  });
});

type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function render(ui: ReactElement, { runtimeContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.runtime], {
    userContext: undefined,
    runtimeContext,
  });
  const ProvidersWrapper = composeProviders(wrapper, serverSettings$.Provider);

  return {
    ...context,
    ...renderBase(
      <ProvidersWrapper>
        <MemoryRouter initialEntries={['/waiting-room']}>
          <Routes>
            <Route path="/waiting-room" element={ui} />
            <Route path="/room/:roomIdentifier" element={<RoomStub />} />
          </Routes>
        </MemoryRouter>
      </ProvidersWrapper>
    ),
  };
}

function RoomStub() {
  const { roomIdentifier } = useParams();
  return <div data-testid={`room-${roomIdentifier}`} />;
}

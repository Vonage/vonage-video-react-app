import { render as renderBase, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import bridge$ from '../../stores/bridge';
import WaitingRoomStage from './WaitingRoomStage';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { env } from '../../../env';

vi.mock('@vonage/client-sdk-video');
vi.mock('@utils/waitUntilPlaying/waitUntilPlaying', () => ({ default: () => Promise.resolve() }));

vi.mock('@hooks/usePermissions', () => ({
  default: () => ({
    accessStatus: DEVICE_ACCESS_STATUS.ACCEPTED,
    setAccessStatus: vi.fn(),
  }),
}));

vi.mock('@hooks/useBackgroundPublisherContext', () => ({
  default: () => ({
    initBackgroundLocalPublisher: vi.fn(),
    publisher: null,
  }),
}));

vi.mock('@components/WaitingRoom/VideoContainer', () => ({
  default: () => <div data-testid="video-container" />,
}));

vi.mock('@components/WaitingRoom/VideoContainer/VideoContainer.skeleton', () => ({
  default: () => <div data-testid="video-container-skeleton" />,
}));

vi.mock('@components/WaitingRoom/ControlPanel', () => ({
  default: () => <div data-testid="control-panel" />,
}));

vi.mock('@components/WaitingRoom/UserNameInput', () => ({
  default: () => <div data-testid="username-input" />,
}));

vi.mock('@components/WaitingRoom/UserNameInput/UserNameInput.skeleton', () => ({
  default: () => <div data-testid="username-input-skeleton" />,
}));

vi.mock('@components/DeviceAccessAlert', () => ({
  default: () => <div data-testid="device-access-alert" />,
}));

vi.mock('@ui', async () => {
  const actual = await vi.importActual<typeof import('@ui')>('@ui');
  return {
    ...actual,
    PageLayoutEmbed: Object.assign(
      ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      {
        Left: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Right: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      }
    ),
  };
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  initialRoute?: string;
};

function render(
  ui: ReactElement,
  { userContext, initialRoute = '/waiting-room/my-room' }: RenderOptions = {}
) {
  const { wrapper: ProvidersWrapper, ...context } = makeTestProvider([providers.user], {
    userContext,
  });

  return {
    ...context,
    ...renderBase(
      <bridge$.Provider>
        <ProvidersWrapper>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
              <Route path="/waiting-room/:roomName" element={ui} />
              <Route path="/waiting-room" element={ui} />
              <Route path="/meeting-room" element={<div data-testid="meeting-room" />} />
            </Routes>
          </MemoryRouter>
        </ProvidersWrapper>
      </bridge$.Provider>
    ),
  };
}

describe('WaitingRoomStage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.WAITING_ROOM_ALLOW_DEVICE_SELECTION = true;
    localStorage.setItem('videoSourceEnabled', 'false');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders content when roomName is in URL params', () => {
    render(<WaitingRoomStage />, { initialRoute: '/waiting-room/my-room' });
    expect(screen.getByTestId('video-container')).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
  });

  it('renders skeletons when isRoomReady is false', () => {
    localStorage.setItem('videoSourceEnabled', 'true');
    render(<WaitingRoomStage />, { initialRoute: '/waiting-room/my-room' });

    expect(screen.getByTestId('video-container-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('username-input-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('video-container')).not.toBeInTheDocument();
  });

  it('shows config error message when no roomName and no sessionIdentifier', () => {
    render(<WaitingRoomStage />, { initialRoute: '/waiting-room' });
    expect(screen.getByText(/session-identifier/i)).toBeInTheDocument();
  });

  it('redirects to /waiting-room/:sessionIdentifier when roomName is absent but bridge has a sessionIdentifier', () => {
    const Wrapper = () => {
      // Set bridge state inside a component rendered within the provider
      const actions = bridge$.use.actions();
      actions.partialUpdate({ sessionIdentifier: 'bridge-room' });

      return (
        <MemoryRouter initialEntries={['/waiting-room']}>
          <Routes>
            <Route
              path="/waiting-room/:roomName"
              element={<div data-testid="redirected-to-room" />}
            />
            <Route path="/waiting-room" element={<WaitingRoomStage />} />
          </Routes>
        </MemoryRouter>
      );
    };

    renderBase(
      <bridge$.Provider>
        <Wrapper />
      </bridge$.Provider>
    );

    expect(screen.getByTestId('redirected-to-room')).toBeInTheDocument();
  });
});

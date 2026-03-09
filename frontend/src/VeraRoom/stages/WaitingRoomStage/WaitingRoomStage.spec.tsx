import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import bridge$ from '../../stores/bridge';
import useWaitingRoom from '@hooks/useWaitingRoom';
import WaitingRoomStage from './WaitingRoomStage';

vi.mock('@Context/PreviewPublisherProvider', () => ({
  PreviewPublisherProvider: ({ children }: { children: React.ReactNode }) => children,
  PreviewPublisherContext: {},
}));

vi.mock('@Context/BackgroundEffectsDialog', () => ({
  default: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

vi.mock('@Context/PrecallNetworkTestDialog', () => ({
  default: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

vi.mock('@hooks/useWaitingRoom');

const mockUseWaitingRoom = useWaitingRoom as Mock;

const defaultWaitingRoomReturn = {
  anchorEl: null,
  openAudioInput: false,
  openVideoInput: false,
  openAudioOutput: false,
  username: 'TestUser',
  setUsername: vi.fn(),
  accessStatus: 'accepted',
  isRoomReady: true,
  handleAudioInputOpen: vi.fn(),
  handleVideoInputOpen: vi.fn(),
  handleAudioOutputOpen: vi.fn(),
  handleClose: vi.fn(),
};

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

const renderStage = (initialRoute: string) =>
  render(
    <bridge$.Provider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/waiting-room/:roomName" element={<WaitingRoomStage />} />
          <Route path="/waiting-room" element={<WaitingRoomStage />} />
          <Route path="/meeting-room" element={<div data-testid="meeting-room" />} />
        </Routes>
      </MemoryRouter>
    </bridge$.Provider>
  );

describe('WaitingRoomStage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWaitingRoom.mockReturnValue({ ...defaultWaitingRoomReturn });
  });

  it('renders content when roomName is in URL params', () => {
    renderStage('/waiting-room/my-room');
    expect(screen.getByTestId('video-container')).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
  });

  it('renders skeletons when isRoomReady is false', () => {
    mockUseWaitingRoom.mockReturnValue({
      ...defaultWaitingRoomReturn,
      accessStatus: 'pending',
      isRoomReady: false,
    });

    renderStage('/waiting-room/my-room');

    expect(screen.getByTestId('video-container-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('username-input-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('video-container')).not.toBeInTheDocument();
  });

  it('shows config error message when no roomName and no sessionIdentifier', () => {
    renderStage('/waiting-room');
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

    render(
      <bridge$.Provider>
        <Wrapper />
      </bridge$.Provider>
    );

    expect(screen.getByTestId('redirected-to-room')).toBeInTheDocument();
  });
});

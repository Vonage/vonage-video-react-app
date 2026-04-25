import { render as renderBase, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useNavigate } from 'react-router-dom';
import MemoryRouter from '@test/RouterWrapper';
import { makeTestProvider, providers } from '@test/providers';
import type { VideoClient } from '@core/services';
import RoomJoinContainer from './index';

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});
const mockNavigate = vi.fn();

vi.mock('../../utils/generateRoomName', () => ({
  __esModule: true,
  default: () => 'mocked-room',
}));

const mockCreateSessionMutate = vi.fn();
const mockVideoClient = {
  createSession: (...args: unknown[]) => mockCreateSessionMutate(...args) as unknown,
} as unknown as VideoClient;

vi.mock('../JoinContainerSeparator', () => ({
  __esModule: true,
  default: () => <div data-testid="separator" />,
}));
vi.mock('../JoinExistingRoom', () => ({
  __esModule: true,
  default: () => <div data-testid="join-existing-room" />,
}));

describe('RoomJoinContainer', () => {
  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    mockCreateSessionMutate.mockResolvedValue({ sessionKey: 'mock-session-key' });
  });

  it('renders NewRoomButton, JoinContainerSeparator and JoinExistingRoom components', () => {
    render(
      <MemoryRouter>
        <RoomJoinContainer />
      </MemoryRouter>
    );
    expect(screen.getByTestId('new-room-button')).toBeInTheDocument();
    expect(screen.getByTestId('separator')).toBeInTheDocument();
    expect(screen.getByTestId('join-existing-room')).toBeInTheDocument();
  });

  it('navigates to the waiting room when NewRoomButton is clicked', async () => {
    render(
      <MemoryRouter>
        <RoomJoinContainer />
      </MemoryRouter>
    );

    screen.getByTestId('new-room-button').click();
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/waiting-room/mock-session-key');
    });
  });
});

function render(ui: React.ReactElement) {
  const { wrapper } = makeTestProvider([providers.runtime], {
    runtimeContext: { videoClient: mockVideoClient },
  });
  return renderBase(ui, { wrapper });
}

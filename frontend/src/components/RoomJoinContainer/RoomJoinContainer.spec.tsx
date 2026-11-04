import { render as renderBase, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { makeTestProvider, providers } from '@test/providers';
import type { VideoClient } from '@core/services';
import RoomJoinContainer from './index';

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

  it('creates a room and opens the wizard with its link when NewRoomButton is clicked', async () => {
    expect.assertions(2);
    render(
      <MemoryRouter>
        <RoomJoinContainer />
      </MemoryRouter>
    );

    screen.getByTestId('new-room-button').click();

    expect(await screen.findByRole('dialog')).toHaveTextContent('/waiting-room/mock-session-key');
    expect(mockCreateSessionMutate).toHaveBeenCalledWith({ roomName: 'mocked-room' });
  });
});

function render(ui: React.ReactElement) {
  const { wrapper } = makeTestProvider([providers.runtime], {
    runtimeContext: { videoClient: mockVideoClient },
  });
  return renderBase(ui, { wrapper });
}

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

  it('opens the wizard when NewRoomButton is clicked and creates the room from it', async () => {
    expect.assertions(3);
    render(
      <MemoryRouter>
        <RoomJoinContainer />
      </MemoryRouter>
    );

    screen.getByTestId('new-room-button').click();

    expect(await screen.findByRole('dialog')).toHaveTextContent('Step 1 of 2');
    expect(mockCreateSessionMutate).not.toHaveBeenCalled();

    screen.getByRole('button', { name: 'Create meeting' }).click();

    expect(await screen.findByText(/\/waiting-room\/mock-session-key$/)).toBeInTheDocument();
  });
});

function render(ui: React.ReactElement) {
  const { wrapper } = makeTestProvider([providers.runtime], {
    runtimeContext: { videoClient: mockVideoClient },
  });
  return renderBase(ui, { wrapper });
}

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
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

  it('navigates to the waiting room when NewRoomButton is clicked', () => {
    render(
      <MemoryRouter>
        <RoomJoinContainer />
      </MemoryRouter>
    );

    screen.getByTestId('new-room-button').click();
    expect(mockNavigate).toHaveBeenCalledWith('/waiting-room/mocked-room');
  });
});

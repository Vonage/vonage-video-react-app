import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it, Mock, vi, beforeEach } from 'vitest';
import JoinWaitRoomButton from './JoinWaitRoomButton';

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();
const mockSetHasError = vi.fn();

describe('JoinWaitRoomButtonComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockSetHasError.mockClear();
  });

  it('should navigate to the waiting room if the room name is valid', () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    render(
      <MemoryRouter>
        <JoinWaitRoomButton roomName="test-room" isDisabled={false} setHasError={mockSetHasError} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockNavigate).toHaveBeenCalledWith('/waiting-room/test-room');
  });

  it('should not navigate and set error if the room name is empty', () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    render(
      <MemoryRouter>
        <JoinWaitRoomButton roomName="" isDisabled={false} setHasError={mockSetHasError} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetHasError).toHaveBeenCalledWith(true);
  });
});

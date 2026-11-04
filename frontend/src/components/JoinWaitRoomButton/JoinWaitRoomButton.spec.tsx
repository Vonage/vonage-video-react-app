import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate, MemoryRouter } from 'react-router-dom';
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
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  it('should navigate to the waiting room of the room id', () => {
    render(
      <MemoryRouter>
        <JoinWaitRoomButton roomId="Test-Room" isDisabled={false} setHasError={mockSetHasError} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockNavigate).toHaveBeenCalledWith('/waiting-room/test-room');
    expect(mockSetHasError).not.toHaveBeenCalled();
  });

  it('should not navigate and set error if the room id is invalid', () => {
    render(
      <MemoryRouter>
        <JoinWaitRoomButton roomId="" isDisabled={false} setHasError={mockSetHasError} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetHasError).toHaveBeenCalledWith(true);
  });
});

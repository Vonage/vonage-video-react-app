import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewRoomButton from './NewRoomButton';

describe('NewRoomButton', () => {
  const mockHandleNewRoom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders New room button correctly', async () => {
    render(<NewRoomButton handleNewRoom={mockHandleNewRoom} />);

    const icon = screen.getByTestId('VideoCallIcon');
    const button = screen.getByTestId('new-room-button');
    expect(icon).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/Create room/i);
    expect(button).toBeEnabled();

    await userEvent.click(button);
    expect(mockHandleNewRoom).toHaveBeenCalled();
  });
});

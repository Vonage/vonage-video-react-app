import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ReenterRoomButton from './index';

describe('ReenterRoomButton', () => {
  it('should display the correct reenter room button', async () => {
    const mockFn = vi.fn();

    render(<ReenterRoomButton roomName="room1" handleReenter={mockFn} />);

    // Use user-event to simulate click
    const button = screen.getByTestId('reenterButton');
    await userEvent.click(button);

    // Check button is correctly displayed
    expect(screen.getByText('Re-enter')).toBeInTheDocument();
    expect(mockFn).toHaveBeenCalled();
  });

  it('should not display the reenter room button', async () => {
    const mockFn = vi.fn();

    render(<ReenterRoomButton roomName="" handleReenter={mockFn} />);

    // Check button is hidden
    expect(screen.queryByTestId('reenterButton')).not.toBeInTheDocument();
    expect(screen.queryByText('Re-enter')).not.toBeInTheDocument();
    expect(mockFn).not.toHaveBeenCalled();
  });
});

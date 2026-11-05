import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RoomNameInput from './RoomNameInput';

describe('RoomNameInputComponent', () => {
  it('keeps the room id as typed and clears the error', () => {
    const setRoomId = vi.fn();
    const setHasError = vi.fn();
    render(
      <RoomNameInput setRoomId={setRoomId} setHasError={setHasError} roomId="" hasError={false} />
    );

    fireEvent.change(screen.getByRole('textbox', { name: 'Room ID' }), {
      target: { value: 'My-Room' },
    });

    expect(setRoomId).toHaveBeenCalledWith('My-Room');
    expect(setHasError).toHaveBeenCalledWith(false);
    expect(screen.getByPlaceholderText('Enter a room ID')).toBeInTheDocument();
    expect(screen.queryByText('Enter a valid room ID')).not.toBeInTheDocument();
  });

  it('shows the error text when the input has an error', () => {
    render(
      <RoomNameInput setRoomId={vi.fn()} setHasError={vi.fn()} roomId="invalid room" hasError />
    );

    expect(screen.getByText('Enter a valid room ID')).toBeInTheDocument();
  });
});

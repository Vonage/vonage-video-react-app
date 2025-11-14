import { render, screen, fireEvent } from '@testing-library/react';
import { SetStateAction, Dispatch } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import RoomNameInput from './RoomNameInput';

describe('RoomNameInputComponent', () => {
  let setRoomName: Dispatch<SetStateAction<string>>;
  let setHasError: Dispatch<SetStateAction<boolean>>;

  beforeEach(() => {
    setRoomName = vi.fn();
    setHasError = vi.fn();
  });

  describe('should set the room name', () => {
    const testCases = [
      { input: 'test_room' },
      { input: 'test+room' },
      { input: 'another-test_room' },
      { input: '123testroom' },
    ];

    testCases.forEach(({ input }) => {
      it('if the input is valid', () => {
        render(
          <RoomNameInput
            setRoomName={setRoomName}
            setHasError={setHasError}
            roomName="test-room"
            hasError={false}
          />
        );

        const inputBox = screen.getByRole('textbox');
        fireEvent.change(inputBox, { target: { value: input } });

        expect(setHasError).toHaveBeenCalledWith(false);
        expect(setRoomName).toHaveBeenCalledWith(input);
      });
    });
  });

  describe('should reject the name', () => {
    const testCases = [
      { input: 'test@room' },
      { input: 'invalid#name' },
      { input: 'invalid/room/name' },
      { input: 'invalid%room%name' },
    ];

    testCases.forEach(({ input }) => {
      it('if the input is invalid', () => {
        render(
          <RoomNameInput
            setRoomName={setRoomName}
            setHasError={setHasError}
            roomName="test-room"
            hasError={false}
          />
        );

        const inputBox = screen.getByRole('textbox');
        fireEvent.change(inputBox, { target: { value: input } });

        expect(setHasError).toHaveBeenCalledWith(true);
        expect(setRoomName).not.toHaveBeenCalledWith(input);
      });
    });
  });

  it('should set the room name as lowercase even if the parameter is a mix of both lower and upper case', () => {
    render(
      <RoomNameInput
        setRoomName={setRoomName}
        setHasError={setHasError}
        roomName="test-room"
        hasError={false}
      />
    );

    const input = screen.getByRole('textbox');
    const newRoomName = 'thisIsANewRoom';
    fireEvent.change(input, { target: { value: newRoomName } });

    expect(setHasError).toHaveBeenCalledWith(false);
    expect(setRoomName).toHaveBeenCalledWith(newRoomName.toLowerCase());
  });

  it('should show an error if the input contains invalid characters', () => {
    render(
      <RoomNameInput
        setRoomName={setRoomName}
        setHasError={setHasError}
        roomName="test-room"
        hasError
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '%20' } });

    expect(setHasError).toHaveBeenCalledWith(true);
    expect(setRoomName).not.toHaveBeenCalled();
    expect(
      screen.getByText('Cannot be empty, contain spaces or special characters')
    ).toBeInTheDocument();
  });

  it('should not show an error if the user erased the input', () => {
    render(
      <RoomNameInput
        setRoomName={setRoomName}
        setHasError={setHasError}
        roomName="test-room"
        hasError
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });

    expect(setHasError).toHaveBeenCalledWith(false);
    // The room name gets set to its original state
    expect(setRoomName).toHaveBeenCalledWith('');
  });
});

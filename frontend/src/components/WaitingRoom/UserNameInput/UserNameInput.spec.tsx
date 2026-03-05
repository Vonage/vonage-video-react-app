import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render as renderBase, screen, fireEvent } from '@testing-library/react';
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoomName from '@hooks/useRoomName';
import { makeTestProvider, providers } from '@test/providers';
import UsernameInput from './UserNameInput';

vi.mock('@hooks/useRoomName');

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@utils/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@utils/storage')>();
  return {
    ...actual,
    setStorageItem: vi.fn(),
  };
});

describe('UsernameInput', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useRoomName).mockReturnValue('valid-room');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the username text field and join button', () => {
    render(<UsernameInput username="" setUsername={vi.fn()} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'button.join' })).toBeInTheDocument();
  });

  it('displays the room name', () => {
    render(<UsernameInput username="" setUsername={vi.fn()} />);

    expect(screen.getByText('valid-room')).toBeVisible();
  });

  it('calls setUsername when typing in the input', () => {
    const setUsername = vi.fn();
    render(<UsernameInput username="" setUsername={setUsername} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'John' } });

    expect(setUsername).toHaveBeenCalledWith('John');
  });

  it('shows an error when submitting with an empty username', () => {
    render(<UsernameInput username="" setUsername={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'button.join' }));

    expect(screen.getByText('waitingRoom.user.input.error')).toBeVisible();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows an error when username is only whitespace', () => {
    render(<UsernameInput username="   " setUsername={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'button.join' }));

    expect(screen.getByText('waitingRoom.user.input.error')).toBeVisible();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to the room on valid submission', () => {
    render(<UsernameInput username="John Doe" setUsername={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'button.join' }));

    expect(mockNavigate).toHaveBeenCalledWith('/room/valid-room', { state: { hasAccess: true } });
  });

  it('disables the join button when the room name is invalid', () => {
    vi.mocked(useRoomName).mockReturnValue('Invalid Room!');

    render(<UsernameInput username="John" setUsername={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'button.join' })).toBeDisabled();
  });

  it('shows an invalid room name message when the room name is invalid', () => {
    vi.mocked(useRoomName).mockReturnValue('Invalid Room!');

    render(<UsernameInput username="John" setUsername={vi.fn()} />);

    expect(screen.getByText('waitingRoom.invalidRoomName')).toBeVisible();
  });

  it('shows an error when username contains special characters', () => {
    render(<UsernameInput username="John@!" setUsername={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'button.join' }));

    expect(screen.getByText('waitingRoom.user.input.error')).toBeVisible();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables the join button when room name becomes invalid after a re-render', () => {
    vi.mocked(useRoomName).mockReturnValue('valid-room');
    const { rerender } = render(<UsernameInput username="John" setUsername={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'button.join' })).toBeEnabled();
    expect(screen.queryByText('waitingRoom.invalidRoomName')).not.toBeInTheDocument();

    vi.mocked(useRoomName).mockReturnValue('Invalid@Room!');
    rerender(<UsernameInput username="John" setUsername={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'button.join' })).toBeDisabled();
    expect(screen.getByText('waitingRoom.invalidRoomName')).toBeVisible();
  });

  it('re-enables the join button when room name becomes valid after a re-render', () => {
    vi.mocked(useRoomName).mockReturnValue('Invalid Room!');
    const { rerender } = render(<UsernameInput username="John" setUsername={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'button.join' })).toBeDisabled();

    vi.mocked(useRoomName).mockReturnValue('valid-room');
    rerender(<UsernameInput username="John" setUsername={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'button.join' })).toBeEnabled();
  });

  it('clears the username error when user starts typing again', () => {
    render(<UsernameInput username="" setUsername={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'button.join' }));
    expect(screen.getByText('waitingRoom.user.input.error')).toBeVisible();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'J' } });

    expect(screen.queryByText('waitingRoom.user.input.error')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper } = makeTestProvider([providers.user]);
  return renderBase(ui, { wrapper });
}

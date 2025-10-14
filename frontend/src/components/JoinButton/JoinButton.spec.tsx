import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it, Mock, vi } from 'vitest';
import JoinButton from './JoinButton';

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();

describe('JoinButtonComponent', () => {
  it('should navigate to the waiting room if the room name is valid', () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    render(
      <MemoryRouter>
        <JoinButton roomName="test-room" isDisabled={false} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockNavigate).toHaveBeenCalledWith('/precall/test-room');
  });

  it('should not navigate to the waiting room if the room name is empty', () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    render(
      <MemoryRouter>
        <JoinButton roomName="" isDisabled={false} />
      </MemoryRouter>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not navigate to the waiting room if the button is disabled', () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    render(
      <MemoryRouter>
        <JoinButton roomName="test-room" isDisabled />
      </MemoryRouter>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});

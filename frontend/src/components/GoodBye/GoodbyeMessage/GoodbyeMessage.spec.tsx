import { render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it, Mock, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import GoodByeMessage from './GoodbyeMessage';

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();

describe('GoodbyeMessage', () => {
  const headerMessage = 'This is a header message';
  const goodbyeMessage = 'This is a goodbye message';
  const roomName = 'This is a test room';
  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  it('renders the header', () => {
    render(
      <MemoryRouter>
        <GoodByeMessage roomName={roomName} message={goodbyeMessage} header={headerMessage} />
      </MemoryRouter>
    );
    const header = screen.getByTestId('header-message');
    expect(header.textContent).toBe(headerMessage);
  });

  it('renders the goodbye message', () => {
    render(
      <MemoryRouter>
        <GoodByeMessage roomName={roomName} message={goodbyeMessage} header={headerMessage} />
      </MemoryRouter>
    );
    const goodbye = screen.getByTestId('goodbye-message');
    expect(goodbye.textContent).toBe(goodbyeMessage);
  });

  it('renders the re-enter button and navigates back to the waiting room', async () => {
    render(
      <MemoryRouter>
        <GoodByeMessage roomName={roomName} message={goodbyeMessage} header={headerMessage} />
      </MemoryRouter>
    );
    const reenterButton = screen.getByTestId('reenterButton');
    expect(reenterButton).toBeInTheDocument();

    await userEvent.click(reenterButton);
    expect(mockNavigate).toHaveBeenCalledWith(`/waiting-room/${roomName}`);
  });
});

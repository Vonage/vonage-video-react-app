import { render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it, Mock, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import GoodByeMessage from './GoodbyeMessage';
import { SMALL_VIEWPORT } from '../../../utils/constants';

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();
const headerMessage = 'This is a header message';
const goodbyeMessage = 'This is a goodbye message';
const roomName = 'This is a test room';

describe('GoodbyeMessage', () => {
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

describe('GoodbyeMessage screen less than SMALL_VIEWPORT', () => {
  const originalMatchMedia = window.matchMedia;
  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);

    window.matchMedia = (query: string) => ({
      matches: new RegExp(`\\(max-width:\\s*${SMALL_VIEWPORT}px\\)`).test(query),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('renders correctly on small screens', () => {
    render(
      <MemoryRouter>
        <GoodByeMessage roomName={roomName} message={goodbyeMessage} header={headerMessage} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('goodbye-message')).toBeInTheDocument();
    expect(screen.getByTestId('goodbye-message')).toHaveClass('w-full');
    expect(screen.getByTestId('goodbye-message')).not.toHaveClass('w-[400px]');
  });
});

describe('GoodbyeMessage screen greater than SMALL_VIEWPORT', () => {
  const originalMatchMedia = window.matchMedia;
  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);

    window.matchMedia = (query: string) => ({
      matches: new RegExp(`\\(min-width:\\s*${SMALL_VIEWPORT + 1}px\\)`).test(query),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('renders correctly on large screens', () => {
    render(
      <MemoryRouter>
        <GoodByeMessage roomName={roomName} message={goodbyeMessage} header={headerMessage} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('goodbye-message')).toBeInTheDocument();
    expect(screen.getByTestId('goodbye-message')).toHaveClass('w-[400px]');
    expect(screen.getByTestId('goodbye-message')).not.toHaveClass('w-full');
  });
});

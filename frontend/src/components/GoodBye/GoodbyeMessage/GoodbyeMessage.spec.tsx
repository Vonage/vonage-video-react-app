import { render, screen } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import MemoryRouter from '@test/RouterWrapper';
import { describe, expect, it, Mock, vi, beforeEach, afterAll } from 'vitest';
import GoodByeMessage from './GoodbyeMessage';

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...mod, useNavigate: vi.fn() };
});

const mockNavigate = vi.fn();
const headerMessage = 'This is a header message';
const goodbyeMessage = 'This is a goodbye message';

describe('GoodbyeMessage', () => {
  const originalMatchMedia = globalThis.matchMedia;

  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  afterAll(() => {
    globalThis.matchMedia = originalMatchMedia;
  });

  it('renders the header', () => {
    render(
      <MemoryRouter>
        <GoodByeMessage message={goodbyeMessage} header={headerMessage} />
      </MemoryRouter>
    );
    const header = screen.getByTestId('header-message');
    expect(header.textContent).toBe(headerMessage);
  });

  it('renders the goodbye message', () => {
    render(
      <MemoryRouter>
        <GoodByeMessage message={goodbyeMessage} header={headerMessage} />
      </MemoryRouter>
    );
    const goodbye = screen.getByTestId('goodbye-message');
    expect(goodbye.textContent).toBe(goodbyeMessage);
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MiniModeIcon from './MiniModeIcon';

const SVG_FIXTURE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="currentColor"/></svg>';

const makeFetchMock = (status = 200, body = SVG_FIXTURE) =>
  vi.fn(() =>
    Promise.resolve({
      ok: status === 200,
      text: () => Promise.resolve(body),
    })
  );

describe('MiniModeIcon', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', makeFetchMock());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and renders the SVG from the Vonage CDN', async () => {
    render(<MiniModeIcon name="microphone-solid" />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-mode-icon-microphone-solid').innerHTML).toContain('<svg');
    });
  });

  it('applies the colour and size via inline styles', async () => {
    render(<MiniModeIcon name="microphone-line" color="#ff0000" size={32} />);

    const icon = await screen.findByTestId('mini-mode-icon-microphone-line');
    expect(icon).toHaveStyle({ color: '#ff0000', width: '32px', height: '32px' });
  });

  it('renders with default colour and size when not provided', async () => {
    render(<MiniModeIcon name="microphone-off-solid" />);

    const icon = await screen.findByTestId('mini-mode-icon-microphone-off-solid');
    expect(icon).toHaveStyle({ color: 'currentColor', width: '20px', height: '20px' });
  });

  it('clears content when the fetch fails', async () => {
    vi.stubGlobal('fetch', makeFetchMock(404, 'Not Found'));
    render(<MiniModeIcon name="microphone-slash-solid" />);

    const icon = await screen.findByTestId('mini-mode-icon-microphone-slash-solid');
    await waitFor(() => {
      expect(icon.innerHTML).toBe('');
    });
  });
});

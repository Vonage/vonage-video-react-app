import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MiniModeIcon from './MiniModeIcon';
import { resetIconCache, loadIconSvg } from './useIconSvg';

const SVG_FIXTURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="currentColor"/></svg>';

const makeFetchMock = (status = 200, body = SVG_FIXTURE) =>
  vi.fn(() =>
    Promise.resolve({
      ok: status === 200,
      text: () => Promise.resolve(body),
    } as Response)
  );

describe('MiniModeIcon', () => {
  beforeEach(() => {
    resetIconCache();
    vi.stubGlobal('fetch', makeFetchMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    resetIconCache();
  });

  it('renders an empty container until the SVG finishes loading, then injects the markup', async () => {
    render(<MiniModeIcon name="custom-icon" />);

    const icon = screen.getByTestId('mini-mode-icon-custom-icon');
    expect(icon.innerHTML).toBe('');

    await act(async () => {
      await loadIconSvg('custom-icon');
    });

    await waitFor(() => {
      expect(icon.innerHTML).toContain('<svg');
    });
    // SVG dimensions are normalized so the icon fills its container
    expect(icon.innerHTML).toContain('width="100%"');
    expect(icon.innerHTML).toContain('height="100%"');
  });

  it('applies the colour, size, and className to the icon container', () => {
    render(<MiniModeIcon name="styled-icon" color="#ff0000" size={32} className="rotate-180" />);

    const icon = screen.getByTestId('mini-mode-icon-styled-icon');
    expect(icon).toHaveStyle({ color: '#ff0000', width: '32px', height: '32px' });
    expect(icon).toHaveClass('rotate-180');
  });

  it('renders with default colour and size when not provided', () => {
    render(<MiniModeIcon name="default-icon" />);

    const icon = screen.getByTestId('mini-mode-icon-default-icon');
    expect(icon).toHaveStyle({ color: 'currentColor', width: '20px', height: '20px' });
  });

  it('does not refetch an icon that is already cached', async () => {
    const fetchMock = makeFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    await loadIconSvg('cached-icon');
    await loadIconSvg('cached-icon');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the icon empty and does not throw when the fetch rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network down')))
    );

    render(<MiniModeIcon name="reject-icon" />);

    await expect(loadIconSvg('reject-icon')).resolves.toBeUndefined();

    const icon = screen.getByTestId('mini-mode-icon-reject-icon');
    await waitFor(() => {
      expect(icon.innerHTML).toBe('');
    });
  });

  it('keeps the icon empty when the response is not ok', async () => {
    vi.stubGlobal('fetch', makeFetchMock(404, 'Not Found'));

    render(<MiniModeIcon name="missing-icon" />);
    await loadIconSvg('missing-icon');

    const icon = screen.getByTestId('mini-mode-icon-missing-icon');
    await waitFor(() => {
      expect(icon.innerHTML).toBe('');
    });
  });
});

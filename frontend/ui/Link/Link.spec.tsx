import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Link from './Link';

describe('Link', () => {
  it('renders correctly', () => {
    render(<Link href="/test">Test Link</Link>);

    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();

    render(
      <Link href="/test" onClick={handleClick}>
        Clickable Link
      </Link>
    );

    const link = screen.getByRole('link');
    fireEvent.click(link);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('opens in new tab when target is specified', () => {
    render(
      <Link href="https://example.com" target="_blank" rel="noopener">
        External Link
      </Link>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('handles disabled state', () => {
    render(
      <Link
        href="/disabled"
        sx={{ pointerEvents: 'none', color: 'text.disabled' }}
        data-testid="disabled-link"
      >
        Disabled Link
      </Link>
    );

    const link = screen.getByTestId('disabled-link');
    expect(link).toBeInTheDocument();
  });
});

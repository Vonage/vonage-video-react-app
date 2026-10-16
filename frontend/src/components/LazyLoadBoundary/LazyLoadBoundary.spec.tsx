import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LazyLoadBoundary from './LazyLoadBoundary';

describe('LazyLoadBoundary', () => {
  it('renders its children when there is no error', () => {
    render(
      <LazyLoadBoundary>
        <div data-testid="child" />
      </LazyLoadBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('shows a retry UI instead of tearing down the rest of the page when a child throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowingChild = (): never => {
      throw new Error('chunk load failed');
    };

    try {
      render(
        <div>
          <div data-testid="sibling">Still here</div>
          <LazyLoadBoundary>
            <ThrowingChild />
          </LazyLoadBoundary>
        </div>
      );

      expect(screen.getByTestId('sibling')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('retrying reloads the page rather than reusing the cached rejected import', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload: reloadSpy });

    const ThrowingChild = (): never => {
      throw new Error('chunk load failed');
    };

    try {
      render(
        <LazyLoadBoundary>
          <ThrowingChild />
        </LazyLoadBoundary>
      );

      screen.getByRole('button', { name: /retry/i }).click();

      expect(reloadSpy).toHaveBeenCalledTimes(1);
    } finally {
      errorSpy.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});

import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorResponse from './ErrorResponse';

describe('ErrorResponse', () => {
  const mockSetErrorResponse = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when errorResponse is null', () => {
    render(<ErrorResponse errorResponse={null} setErrorResponse={mockSetErrorResponse} />);
    expect(screen.queryByText(/Error:/)).toBeNull();
  });

  it('renders error message when there is an error present', () => {
    render(
      <ErrorResponse errorResponse="Failed to fetch" setErrorResponse={mockSetErrorResponse} />
    );
    expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
  });
});

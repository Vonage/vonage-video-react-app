import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import CaptionsError from './CaptionsError';

describe('CaptionsError', () => {
  const mockSetCaptionsErrorResponse = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when captionsErrorResponse is null', () => {
    render(
      <CaptionsError
        captionsErrorResponse={null}
        setCaptionsErrorResponse={mockSetCaptionsErrorResponse}
      />
    );
    expect(screen.queryByText(/Captions error:/)).toBeNull();
  });

  it('renders error message when there is an error in captions', () => {
    render(
      <CaptionsError
        captionsErrorResponse="Failed to fetch captions"
        setCaptionsErrorResponse={mockSetCaptionsErrorResponse}
      />
    );
    expect(screen.getByText(/Captions error: Failed to fetch captions/)).toBeInTheDocument();
  });
});

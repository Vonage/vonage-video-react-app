import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BackgroundVideoContainer from './BackgroundVideoContainer';

vi.mock('../../../utils/waitUntilPlaying', () => ({
  __esModule: true,
  default: vi.fn(() => Promise.resolve()),
}));

describe('BackgroundVideoContainer', () => {
  it('shows message when video is not enabled', () => {
    render(<BackgroundVideoContainer isParentVideoEnabled={false} />);
    expect(screen.getByText(/You have not enabled video/i)).toBeInTheDocument();
  });

  it('renders video element when video is enabled', () => {
    const videoEl = document.createElement('video');
    render(<BackgroundVideoContainer isParentVideoEnabled publisherVideoElement={videoEl} />);
    expect(videoEl.classList.contains('video__element')).toBe(true);
    expect(videoEl.title).toBe('publisher-preview');
  });

  it('shows loading spinner while video is loading', () => {
    const videoEl = document.createElement('video');
    render(<BackgroundVideoContainer isParentVideoEnabled publisherVideoElement={videoEl} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

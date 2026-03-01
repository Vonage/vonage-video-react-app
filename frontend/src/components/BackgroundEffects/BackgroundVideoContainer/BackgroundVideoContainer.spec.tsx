import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReactNode } from 'react';
import UserProvider from '../../../Context/user';
import BackgroundVideoContainer from './BackgroundVideoContainer';

vi.mock('../../../utils/waitUntilPlaying', () => ({
  __esModule: true,
  default: vi.fn(() => Promise.resolve()),
}));

const wrapper = ({ children }: { children: ReactNode }) => <UserProvider>{children}</UserProvider>;

describe('BackgroundVideoContainer', () => {
  it('shows message when video is not enabled', () => {
    render(<BackgroundVideoContainer isParentVideoEnabled={false} />, { wrapper });
    expect(screen.getByText(/Your camera is turned off/i)).toBeInTheDocument();
  });

  it('renders video element when video is enabled', async () => {
    const videoEl = document.createElement('video');
    act(() => {
      render(<BackgroundVideoContainer isParentVideoEnabled publisherVideoElement={videoEl} />, {
        wrapper,
      });
    });
    await waitFor(() => {
      expect(videoEl.classList.contains('video__element')).toBe(true);
      expect(videoEl.title).toBe('publisher-preview');
    });
  });

  it('shows loading spinner while video is loading', async () => {
    const videoEl = document.createElement('video');
    act(() => {
      render(<BackgroundVideoContainer isParentVideoEnabled publisherVideoElement={videoEl} />, {
        wrapper,
      });
    });
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});

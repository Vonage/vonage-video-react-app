import type { Publisher } from '@vonage/client-sdk-video';
import { render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { UseScreenShareType } from '../../hooks/useScreenShare';
import useScreenShare from '../../hooks/useScreenShare';
import useScreenShareContext from '../../hooks/useScreenShareContext';
import { ScreenShareProvider } from './ScreenShareProvider';

const screenShareValue: UseScreenShareType = {
  isSharingScreen: true,
  isEntireScreen: false,
  screensharingPublisher: { id: 'screen-publisher' } as unknown as Publisher,
  screenshareVideoElement: undefined,
  toggleShareScreen: vi.fn(),
};

vi.mock('../../hooks/useScreenShare', () => ({
  default: vi.fn(),
}));

describe('ScreenShareProvider', () => {
  it('passes the useScreenShare value through to consumers unchanged', () => {
    vi.mocked(useScreenShare).mockReturnValue(screenShareValue);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ScreenShareProvider>{children}</ScreenShareProvider>
    );

    const { result } = renderHook(() => useScreenShareContext(), { wrapper });

    expect(result.current).toBe(screenShareValue);
  });

  it('renders its children', () => {
    vi.mocked(useScreenShare).mockReturnValue(screenShareValue);

    render(
      <ScreenShareProvider>
        <div>child content</div>
      </ScreenShareProvider>
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('degrades to an empty context outside the provider, as in the waiting room', () => {
    const { result } = renderHook(() => useScreenShareContext());

    expect(result.current.screensharingPublisher).toBeUndefined();
  });
});

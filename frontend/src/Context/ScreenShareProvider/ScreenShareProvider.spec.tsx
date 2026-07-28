import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import useScreenShareContext from '../../hooks/useScreenShareContext';
import { ScreenShareProvider } from './ScreenShareProvider';

const toggleShareScreen = vi.fn();
const screensharingPublisher = { id: 'screen-publisher' };

vi.mock('../../hooks/useScreenShare', () => ({
  default: () => ({
    isSharingScreen: true,
    isEntireScreen: false,
    screensharingPublisher,
    screenshareVideoElement: undefined,
    toggleShareScreen,
  }),
}));

describe('ScreenShareProvider', () => {
  it('exposes the screen-share publisher to consumers', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ScreenShareProvider>{children}</ScreenShareProvider>
    );

    const { result } = renderHook(() => useScreenShareContext(), { wrapper });

    expect(result.current.screensharingPublisher).toBe(screensharingPublisher);
    expect(result.current.isSharingScreen).toBe(true);
    expect(result.current.toggleShareScreen).toBe(toggleShareScreen);
  });

  it('degrades to an empty context outside the provider, as in the waiting room', () => {
    const { result } = renderHook(() => useScreenShareContext());

    expect(result.current.screensharingPublisher).toBeUndefined();
  });
});

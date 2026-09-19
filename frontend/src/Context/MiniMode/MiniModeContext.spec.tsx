import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { requestDocumentPictureInPictureWindow } from '@common/documentPictureInPicture';
import { MiniModeProvider, useMiniMode } from './MiniModeContext';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@hooks/useSessionContext', () => ({
  default: () => ({
    subscriberWrappers: [],
    activeSpeakerId: null,
    registerActiveSpeakerChangeHandler: vi.fn(),
    unregisterActiveSpeakerChangeHandler: vi.fn(),
    disconnect: vi.fn(),
    sessionKey: 'test-session',
  }),
}));

vi.mock('@hooks/usePublisherContext', () => ({
  default: () => ({
    publisherVideoElement: null,
    publisher: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
    toggleAudio: vi.fn(),
    toggleVideo: vi.fn(),
  }),
}));

vi.mock('@hooks/useBackgroundPublisherContext', () => ({
  default: () => ({
    destroyBackgroundPublisher: vi.fn(),
  }),
}));

vi.mock('@common/documentPictureInPicture', () => ({
  isDocumentPictureInPictureSupported: vi.fn(() => false),
  requestDocumentPictureInPictureWindow: vi.fn(),
  copyStylesToDocument: vi.fn(),
  syncStylesToWindow: vi.fn(() => () => undefined),
  captureNodeOrigin: vi.fn(),
  restoreNodeOrigin: vi.fn(),
}));

vi.mock('../../components/MeetingRoom/MiniCallWindow', () => ({
  default: () => <div data-testid="mini-call-window" />,
}));

vi.mock('./resolveMiniModeParticipant', () => ({
  default: vi.fn(() => ({ element: null, name: 'Test', initials: 'T' })),
}));

describe('MiniModeContext', () => {
  it('useMiniMode throws when used outside of a MiniModeProvider', () => {
    const Probe = (): ReactElement | null => {
      useMiniMode();
      return null;
    };

    expect(() => render(<Probe />)).toThrow('useMiniMode must be used within a MiniModeProvider');
  });

  it('renders children and exposes supported=false inside the provider', () => {
    const Probe = (): ReactElement => {
      const ctx = useMiniMode();
      return (
        <>
          <div data-testid="child">Content</div>
          <span data-testid="supported">{String(ctx.isSupported)}</span>
          <span data-testid="isOpen">{String(ctx.isOpen)}</span>
        </>
      );
    };

    render(
      <MiniModeProvider>
        <Probe />
      </MiniModeProvider>
    );

    expect(screen.getByTestId('child').textContent).toBe('Content');
    expect(screen.getByTestId('supported').textContent).toBe('false');
    expect(screen.getByTestId('isOpen').textContent).toBe('false');
  });

  it('enter is a no-op when the Document PiP API is unavailable', async () => {
    const Probe = (): ReactElement => {
      const ctx = useMiniMode();
      return (
        <button data-testid="enter-btn" onClick={() => void ctx.enter()}>
          enter
        </button>
      );
    };

    render(
      <MiniModeProvider>
        <Probe />
      </MiniModeProvider>
    );

    screen.getByTestId('enter-btn').click();

    // No window should be opened — enter should simply return
    await new Promise((resolve) => setTimeout(resolve, 50));

    // enter() returns early when the PiP API is unsupported, so
    // requestDocumentPictureInPictureWindow must never be called
    expect(requestDocumentPictureInPictureWindow).not.toHaveBeenCalled();
  });
});

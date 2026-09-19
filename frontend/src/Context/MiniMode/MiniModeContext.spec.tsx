import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { requestDocumentPictureInPictureWindow } from '../../utils/documentPictureInPicture';
import { MiniModeProvider, useMiniMode } from './MiniModeContext';
import { buildPipWindowTitle } from './buildPipWindowTitle';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@hooks/useSessionContext', () => ({
  default: () => ({
    subscriberWrappers: [],
    activeSpeakerId: null,
    disconnect: vi.fn(),
    sessionKey: 'test-session',
    sessionDetails: null,
    archiveId: null,
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

vi.mock('../../utils/documentPictureInPicture', () => ({
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
  it('useMiniMode returns the unsupported fallback when no provider is present', () => {
    const Probe = (): ReactElement => {
      const ctx = useMiniMode();
      return (
        <div>
          <span data-testid="supported">{String(ctx.isSupported)}</span>
          <span data-testid="isOpen">{String(ctx.isOpen)}</span>
          <span data-testid="enter-type">{typeof ctx.enter}</span>
          <span data-testid="exit-type">{typeof ctx.exit}</span>
          <span data-testid="leave-type">{typeof ctx.leave}</span>
        </div>
      );
    };

    render(<Probe />);

    expect(screen.getByTestId('supported').textContent).toBe('false');
    expect(screen.getByTestId('isOpen').textContent).toBe('false');
    expect(screen.getByTestId('enter-type').textContent).toBe('function');
    expect(screen.getByTestId('exit-type').textContent).toBe('function');
    expect(screen.getByTestId('leave-type').textContent).toBe('function');
  });

  it('useMiniMode fallback exposes no-op functions when no provider is present', () => {
    const Probe = (): ReactElement => {
      const ctx = useMiniMode();
      return (
        <div>
          <span data-testid="supported">{String(ctx.isSupported)}</span>
          <span data-testid="isOpen">{String(ctx.isOpen)}</span>
          <span data-testid="hostedElement">{ctx.hostedElement === null ? 'null' : 'defined'}</span>
          <span data-testid="participant">{ctx.participant === null ? 'null' : 'defined'}</span>
          <span data-testid="enter-type">{typeof ctx.enter}</span>
          <span data-testid="exit-type">{typeof ctx.exit}</span>
          <span data-testid="leave-type">{typeof ctx.leave}</span>
          <span data-testid="toggleAudio-type">{typeof ctx.toggleAudio}</span>
          <span data-testid="toggleVideo-type">{typeof ctx.toggleVideo}</span>
        </div>
      );
    };

    render(<Probe />);

    expect(screen.getByTestId('supported').textContent).toBe('false');
    expect(screen.getByTestId('isOpen').textContent).toBe('false');
    expect(screen.getByTestId('hostedElement').textContent).toBe('null');
    expect(screen.getByTestId('participant').textContent).toBe('null');
    expect(screen.getByTestId('enter-type').textContent).toBe('function');
    expect(screen.getByTestId('exit-type').textContent).toBe('function');
    expect(screen.getByTestId('leave-type').textContent).toBe('function');
    expect(screen.getByTestId('toggleAudio-type').textContent).toBe('function');
    expect(screen.getByTestId('toggleVideo-type').textContent).toBe('function');
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

describe('buildPipWindowTitle', () => {
  it('returns the room name when not recording', () => {
    expect(buildPipWindowTitle('Team Standup', false)).toBe('Team Standup');
  });

  it('appends a recording indicator to the room name when recording', () => {
    expect(buildPipWindowTitle('Team Standup', true)).toBe('Team Standup ⏺');
  });

  it('falls back to Mini Mode when no room name and not recording', () => {
    expect(buildPipWindowTitle('', false)).toBe('Mini Mode');
  });

  it('falls back to Mini Mode with recording indicator when no room name', () => {
    expect(buildPipWindowTitle('', true)).toBe('Mini Mode ⏺');
  });
});

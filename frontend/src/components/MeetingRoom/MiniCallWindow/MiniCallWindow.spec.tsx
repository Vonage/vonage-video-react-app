import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MiniCallWindow from './MiniCallWindow';
import type { MiniCallWindowProps } from './MiniCallWindow';
import type { MiniModeIconProps } from './MiniModeIcon';

vi.mock('./MiniModeIcon', () => ({
  default: ({ name }: MiniModeIconProps) => <span data-testid={`icon-${name}`} />,
}));

const makeProps = (overrides: Partial<MiniCallWindowProps> = {}): MiniCallWindowProps => ({
  participant: { element: null, name: 'Maya Adeyemi', initials: 'MA' },
  hostedElement: null,
  containerWidth: 360,
  isAudioEnabled: true,
  isVideoEnabled: true,
  isRecording: false,
  onToggleAudio: vi.fn(),
  onToggleVideo: vi.fn(),
  onExpand: vi.fn(),
  onLeave: vi.fn(),
  ...overrides,
});

describe('MiniCallWindow', () => {
  it('renders the control buttons and fires the matching callbacks on click', () => {
    const props = makeProps();

    render(<MiniCallWindow {...props} />);

    expect(screen.getByTestId('mini-call-window')).toBeVisible();

    screen.getByTestId('mini-mode-mute').click();
    screen.getByTestId('mini-mode-camera').click();
    screen.getByTestId('mini-mode-expand').click();
    screen.getByTestId('mini-mode-leave').click();

    expect(props.onToggleAudio).toHaveBeenCalledOnce();
    expect(props.onToggleVideo).toHaveBeenCalledOnce();
    expect(props.onExpand).toHaveBeenCalledOnce();
    expect(props.onLeave).toHaveBeenCalledOnce();
  });

  it('shows the microphone icon when audio is enabled and muted icon when disabled', () => {
    const { rerender } = render(<MiniCallWindow {...makeProps({ isAudioEnabled: true })} />);
    expect(screen.getByTestId('icon-microphone-solid')).toBeInTheDocument();

    rerender(<MiniCallWindow {...makeProps({ isAudioEnabled: false })} />);
    expect(screen.getByTestId('icon-mic-mute-solid')).toBeInTheDocument();
  });

  it('shows the video icon when video is enabled and video-off icon when disabled', () => {
    const { rerender } = render(<MiniCallWindow {...makeProps({ isVideoEnabled: true })} />);
    expect(screen.getByTestId('icon-video-solid')).toBeInTheDocument();

    rerender(<MiniCallWindow {...makeProps({ isVideoEnabled: false })} />);
    expect(screen.getByTestId('icon-video-off-solid')).toBeInTheDocument();
  });

  it('renders the recording indicator only while recording', () => {
    const { rerender } = render(<MiniCallWindow {...makeProps({ isRecording: true })} />);

    const indicator = screen.getByTestId('mini-mode-recording-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator.querySelector('[data-testid="recordingIndicator"]')).not.toBeNull();

    rerender(<MiniCallWindow {...makeProps({ isRecording: false })} />);
    expect(screen.queryByTestId('mini-mode-recording-indicator')).not.toBeInTheDocument();
  });

  it('shows the avatar fallback and participant name when there is no hosted element', () => {
    render(<MiniCallWindow {...makeProps({ hostedElement: null })} />);

    expect(screen.getByText('MA')).toBeInTheDocument();
    expect(screen.getByText('Maya Adeyemi')).toBeInTheDocument();
  });

  it('renders the participant name with the same NameDisplay as the main meeting UI', () => {
    render(<MiniCallWindow {...makeProps({ containerWidth: 360 })} />);

    const nameContainer = screen.getByText('Maya Adeyemi').parentElement;
    expect(nameContainer).toHaveClass('bg-vera-dark-grey-opacity', 'text-vera-accent');
    expect(nameContainer).toHaveStyle({ maxWidth: '328px' });
  });

  it('shows the avatar fallback when video is disabled even with a hosted element', () => {
    const videoElement = document.createElement('video');

    render(
      <MiniCallWindow {...makeProps({ hostedElement: videoElement, isVideoEnabled: false })} />
    );

    expect(screen.getByText('MA')).toBeInTheDocument();
  });

  it('re-parents the hosted element into the window and stretches it to fill', () => {
    const videoElement = document.createElement('video');

    render(<MiniCallWindow {...makeProps({ hostedElement: videoElement })} />);

    const windowElement = screen.getByTestId('mini-call-window');
    expect(windowElement.contains(videoElement)).toBe(true);
    expect(videoElement.style.width).toBe('100%');
    expect(videoElement.style.height).toBe('100%');
    expect(videoElement.style.position).toBe('absolute');
  });
});

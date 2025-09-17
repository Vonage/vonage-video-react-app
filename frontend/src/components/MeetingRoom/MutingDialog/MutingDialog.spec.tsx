import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Stream } from '@vonage/client-sdk-video';
import MutingDialog, { MutingDialogProps } from './MutingDialog';
import useSessionContext from '../../../hooks/useSessionContext';

vi.mock('../../../hooks/useSessionContext');

describe('ParticipantListAudioIndicator', () => {
  const mockForceMute = vi.fn();
  const mockSetIsOpen = vi.fn();
  const mockStream: Stream = {
    connection: { connectionId: 'mock-connection-id', creationTime: Date.now(), data: 'mockData' },
    streamId: 'mock-stream-id',
    creationTime: Date.now(),
    hasAudio: true,
    hasVideo: false,
    name: 'John Doe',
    videoDimensions: { width: 640, height: 480 },
    videoType: 'camera',
    frameRate: 1,
    initials: 'JD',
    hasCaptions: false,
  };

  const defaultProps: MutingDialogProps = {
    isOpen: true,
    setIsOpen: mockSetIsOpen,
    stream: mockStream,
  };

  beforeEach(() => {
    (useSessionContext as Mock).mockReturnValue({ forceMute: mockForceMute });
    vi.clearAllMocks();
  });

  it('renders the muting dialog with the correct text', () => {
    render(<MutingDialog {...defaultProps} />);
    expect(
      screen.getByText(
        'Mute John Doe for everyone in the call? Only John Doe can unmute themselves.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Mute')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('closes the muting dialog when the Cancel button is clicked', () => {
    render(<MutingDialog {...defaultProps} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it('triggers the force mute of the participant and closes the dialog when Mute button is clicked', () => {
    render(<MutingDialog {...defaultProps} />);
    const muteButton = screen.getByText('Mute');
    fireEvent.click(muteButton);
    expect(mockForceMute).toHaveBeenCalledWith(mockStream);
    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it('does not render the muting dialog when it has not been opened', () => {
    render(<MutingDialog {...defaultProps} isOpen={false} />);
    const dialog = screen.queryByRole('dialog');
    expect(dialog).not.toBeInTheDocument();
  });
});

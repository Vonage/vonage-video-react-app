import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stream } from '@vonage/client-sdk-video';
import AudioIndicator, { AudioIndicatorProps } from './AudioIndicator';
import useSessionContext from '../../../hooks/useSessionContext';

vi.mock('../../../hooks/useSessionContext');

describe('AudioIndicator', () => {
  const mockForceMute = vi.fn();
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

  const defaultProps: AudioIndicatorProps = {
    hasAudio: true,
    stream: mockStream,
    audioLevel: undefined,
  };

  beforeEach(() => {
    (useSessionContext as Mock).mockReturnValue({ forceMute: mockForceMute });
    vi.clearAllMocks();
  });

  it('renders Mic icon when participant is unmuted but not speaking', () => {
    render(<AudioIndicator {...defaultProps} />);
    const micIcon = screen.getByTestId('MicIcon');
    expect(micIcon).toBeInTheDocument();
  });

  it('renders Mic off icon when participant is muted', () => {
    render(<AudioIndicator {...defaultProps} hasAudio={false} />);
    const micOffIcon = screen.getByTestId('MicOffIcon');
    expect(micOffIcon).toBeInTheDocument();
  });
});

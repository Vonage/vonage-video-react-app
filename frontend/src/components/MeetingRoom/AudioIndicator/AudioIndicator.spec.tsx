import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stream } from '@vonage/client-sdk-video';
import AudioIndicator, { AudioIndicatorProps } from './AudioIndicator';
import makeSessionProviderWrapper from '@test/providers/makeSessionProviderWrapper';

describe('AudioIndicator', () => {
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

  it('renders Mic icon when participant is unmuted but not speaking', () => {
    const { SessionProviderWrapper } = makeSessionProviderWrapper();

    render(<AudioIndicator {...defaultProps} />, { wrapper: SessionProviderWrapper });
    const micIcon = screen.getByTestId('MicIcon');
    expect(micIcon).toBeInTheDocument();
  });

  it('renders Mic off icon when participant is muted', () => {
    const { SessionProviderWrapper } = makeSessionProviderWrapper();

    render(<AudioIndicator {...defaultProps} hasAudio={false} />, {
      wrapper: SessionProviderWrapper,
    });
    const micOffIcon = screen.getByTestId('MicOffIcon');
    expect(micOffIcon).toBeInTheDocument();
  });
});

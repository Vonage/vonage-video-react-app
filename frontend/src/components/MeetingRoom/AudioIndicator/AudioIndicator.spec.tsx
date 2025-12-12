import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stream } from '@vonage/client-sdk-video';
import AudioIndicator, { AudioIndicatorProps } from './AudioIndicator';
import createTestProviderStack from '@test/providers/createTestProviderStack';

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

  // Only include SessionContext - explicitly exclude other providers
  // to avoid unnecessary dependencies (mediaDevices, Vonage SDK initialization, etc.)
  const TestWrapper = createTestProviderStack({
    includeSession: true,
    includePreviewPublisher: false,
    includeBackgroundPublisher: false,
    includeAudioOutput: false,
  });

  it('renders Mic icon when participant is unmuted but not speaking', () => {
    render(<AudioIndicator {...defaultProps} />, { wrapper: TestWrapper });
    const micIcon = screen.getByTestId('MicIcon');
    expect(micIcon).toBeInTheDocument();
  });

  // We can pass providers inline to avoid initializing unused contexts.
  it('renders Mic off icon when participant is muted', () => {
    render(<AudioIndicator {...defaultProps} hasAudio={false} />, {
      wrapper: createTestProviderStack({
        includeSession: true,
        includePreviewPublisher: false,
        includeBackgroundPublisher: false,
        includeAudioOutput: false,
      }),
    });
    const micOffIcon = screen.getByTestId('MicOffIcon');
    expect(micOffIcon).toBeInTheDocument();
  });
});

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import { Stream } from '@vonage/client-sdk-video';
import AudioIndicator, { AudioIndicatorProps } from './AudioIndicator';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import { ReactElement } from 'react';

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
    vi.clearAllMocks();
  });

  it('renders Mic icon when participant is unmuted but not speaking', () => {
    render(<AudioIndicator {...defaultProps} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.forceMute = mockForceMute;
          }
        },
      },
    });
    const micIcon = screen.getByTestId('MicIcon');
    expect(micIcon).toBeInTheDocument();
  });

  it('renders Mic off icon when participant is muted', () => {
    render(<AudioIndicator {...defaultProps} hasAudio={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.forceMute = mockForceMute;
          }
        },
      },
    });
    const micOffIcon = screen.getByTestId('vivid-icon-mic-mute-solid');
    expect(micOffIcon).toBeInTheDocument();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render(ui: ReactElement, { userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    userContext,
    sessionContext,
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

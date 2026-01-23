import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactElement } from 'react';
import {
  AppConfigProviderWrapperOptions,
  makeAppConfigProviderWrapper,
  makePreviewPublisherProviderWrapper,
  PreviewPublisherProviderWrapperOptions,
} from '@test/providers';
import MicButton from './MicButton';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';
import composeProviders from '@common/helpers/composeProviders';

describe('MicButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      writable: true,
      configurable: true,
      value: mediaDevicesMock,
    });

    vi.spyOn(mediaDevicesMock, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'enumerateDevices').mockResolvedValue([]);
    vi.spyOn(mediaDevicesMock, 'getUserMedia').mockResolvedValue({} as MediaStream);

    Object.defineProperty(globalThis.navigator, 'permissions', {
      writable: true,
      configurable: true,
      value: {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      },
    });
  });

  it('renders the mic on icon when audio is enabled', async () => {
    render(<MicButton />, {
      previewPublisherOptions: {
        __onCreated: (context) => {
          context.isAudioEnabled = true;
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('vivid-icon-microphone-line')).toBeInTheDocument();
    });
  });

  it('renders the mic off icon when audio is disabled', async () => {
    render(<MicButton />, {
      previewPublisherOptions: {
        __onCreated: (context) => {
          context.isAudioEnabled = false;
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('vivid-icon-mic-mute-line')).toBeInTheDocument();
    });
  });

  it('calls toggleAudio when clicked', async () => {
    const toggleAudioMock = vi.fn();
    render(<MicButton />, {
      previewPublisherOptions: {
        __onCreated: (context) => {
          context.isAudioEnabled = true;
          const originalToggle = context.toggleAudio.bind(context);
          context.toggleAudio = () => {
            toggleAudioMock();
            return originalToggle();
          };
        },
      },
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(toggleAudioMock).toHaveBeenCalled();
    });
  });

  it('is not rendered when allowMicrophoneControl is false', async () => {
    render(<MicButton />, {
      appConfigOptions: {
        value: {
          isAppConfigLoaded: true,
          audioSettings: {
            allowMicrophoneControl: false,
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('vivid-icon-microphone-line')).not.toBeInTheDocument();
    });
  });
});

type RenderOptions = {
  appConfigOptions?: AppConfigProviderWrapperOptions;
  previewPublisherOptions?: PreviewPublisherProviderWrapperOptions['previewPublisherOptions'];
};

function render(ui: ReactElement, options?: RenderOptions) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper(options?.appConfigOptions);

  if (!options?.previewPublisherOptions) {
    return renderBase(ui, {
      ...options,
      wrapper: AppConfigWrapper,
    });
  }

  const { PreviewPublisherProviderWrapper } = makePreviewPublisherProviderWrapper({
    previewPublisherOptions: options.previewPublisherOptions,
  });

  return renderBase(ui, {
    ...options,
    wrapper: composeProviders(AppConfigWrapper, PreviewPublisherProviderWrapper),
  });
}

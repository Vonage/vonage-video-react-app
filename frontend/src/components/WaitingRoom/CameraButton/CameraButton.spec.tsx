import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import {
  makePreviewPublisherProviderWrapper,
  type PreviewPublisherProviderWrapperOptions,
  makeBackgroundPublisherProviderWrapper,
  type BackgroundPublisherProviderWrapperOptions,
  makeAppConfigProviderWrapper,
  type AppConfigProviderWrapperOptions,
} from '@test/providers';
import composeProviders from '@common/helpers/composeProviders';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';
import type { PreviewPublisherContextType } from '@Context/PreviewPublisherProvider';
import type { BackgroundPublisherContextType } from '@Context/BackgroundPublisherProvider';
import CameraButton from './CameraButton';

type PreviewPublisherContextWithMock = PreviewPublisherContextType & {
  _previewToggleMockApplied?: boolean;
};

type BackgroundPublisherContextWithMock = BackgroundPublisherContextType & {
  _backgroundToggleMockApplied?: boolean;
};

describe('CameraButton', () => {
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

  it('renders the video on icon when video is enabled', async () => {
    render(<CameraButton />, {
      appConfigOptions: {
        value: {
          isAppConfigLoaded: true,
          videoSettings: {
            allowCameraControl: true,
          },
        },
      },
      previewPublisherOptions: {
        __onCreated: (context) => {
          context.isVideoEnabled = true;
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('vivid-icon-video-line')).toBeInTheDocument();
    });
  });

  it('renders the video off icon when video is disabled', async () => {
    render(<CameraButton />, {
      appConfigOptions: {
        value: {
          isAppConfigLoaded: true,
          videoSettings: {
            allowCameraControl: true,
          },
        },
      },
      previewPublisherOptions: {
        __onCreated: (context) => {
          context.isVideoEnabled = false;
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('vivid-icon-video-off-line')).toBeInTheDocument();
    });
  });

  it('updates the main publisher and the background replacement publisher when clicked', async () => {
    const previewToggleMock = vi.fn();
    const backgroundToggleMock = vi.fn();

    render(<CameraButton />, {
      appConfigOptions: {
        value: {
          isAppConfigLoaded: true,
          videoSettings: {
            allowCameraControl: true,
          },
        },
      },
      previewPublisherOptions: {
        __interceptor: (context) => {
          const contextWithMock = context as PreviewPublisherContextWithMock;
          if (!contextWithMock._previewToggleMockApplied) {
            const originalToggle = context.toggleVideo.bind(context);
            context.toggleVideo = () => {
              previewToggleMock();
              return originalToggle();
            };
            contextWithMock._previewToggleMockApplied = true;
          }
        },
      },
      backgroundPublisherOptions: {
        __interceptor: (context) => {
          const contextWithMock = context as BackgroundPublisherContextWithMock;
          if (!contextWithMock._backgroundToggleMockApplied) {
            const originalToggle = context.toggleVideo.bind(context);
            context.toggleVideo = () => {
              backgroundToggleMock();
              return originalToggle();
            };
            contextWithMock._backgroundToggleMockApplied = true;
          }
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(previewToggleMock).toHaveBeenCalled();
      expect(backgroundToggleMock).toHaveBeenCalled();
    });
  });

  it('is not rendered when allowCameraControl is false', async () => {
    render(<CameraButton />, {
      appConfigOptions: {
        value: {
          isAppConfigLoaded: true,
          videoSettings: {
            allowCameraControl: false,
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('VideocamIcon')).not.toBeInTheDocument();
    });
  });
});

type RenderOptions = {
  previewPublisherOptions?: PreviewPublisherProviderWrapperOptions['previewPublisherOptions'];
  backgroundPublisherOptions?: BackgroundPublisherProviderWrapperOptions['backgroundPublisherOptions'];
  appConfigOptions?: AppConfigProviderWrapperOptions;
};

function render(ui: ReactElement, options: RenderOptions = {}) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper(options.appConfigOptions);
  const { PreviewPublisherProviderWrapper, ...previewProps } = makePreviewPublisherProviderWrapper({
    previewPublisherOptions: options.previewPublisherOptions,
  });
  const { BackgroundPublisherProviderWrapper, ...backgroundProps } =
    makeBackgroundPublisherProviderWrapper({
      backgroundPublisherOptions: options.backgroundPublisherOptions,
    });

  const Wrapper = composeProviders(
    AppConfigWrapper,
    PreviewPublisherProviderWrapper,
    BackgroundPublisherProviderWrapper
  );

  return {
    ...previewProps,
    ...backgroundProps,
    ...renderBase(ui, { wrapper: Wrapper }),
  };
}

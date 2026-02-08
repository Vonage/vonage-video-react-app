import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { makeTestProvider, providers } from '@test/providers';
import type {
  PreviewPublisherProviderWrapperOptions,
  BackgroundPublisherProviderWrapperOptions,
  AppConfigProviderWrapperOptions,
} from '@test/providers';
import type { PreviewPublisherContextType } from '@Context/PreviewPublisherProvider';
import type { BackgroundPublisherContextType } from '@Context/BackgroundPublisherProvider';
import CameraButton from './CameraButton';
import SuspenseBoundary from '@common/components/SuspenseBoundary/SuspenseBoundary';

type PreviewPublisherContextWithMock = PreviewPublisherContextType & {
  _previewToggleMockApplied?: boolean;
};

type BackgroundPublisherContextWithMock = BackgroundPublisherContextType & {
  _backgroundToggleMockApplied?: boolean;
};

describe('CameraButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const { mediaDevices } = globalThis.navigator;

    vi.spyOn(mediaDevices, 'enumerateDevices').mockResolvedValue([]);
    vi.spyOn(mediaDevices, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevices, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevices, 'getUserMedia').mockResolvedValue({} as MediaStream);

    const { permissions } = globalThis.navigator;

    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);
  });

  it('renders the video on icon when video is enabled', async () => {
    render(<CameraButton />, {
      appConfigContext: {
        value: {
          isAppConfigLoaded: true,
          videoSettings: {
            allowCameraControl: true,
          },
        },
      },
      previewPublisherContext: {
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
      appConfigContext: {
        value: {
          isAppConfigLoaded: true,
          videoSettings: {
            allowCameraControl: true,
          },
        },
      },
      previewPublisherContext: {
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
      appConfigContext: {
        value: {
          isAppConfigLoaded: true,
          videoSettings: {
            allowCameraControl: true,
          },
        },
      },
      previewPublisherContext: {
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
      backgroundPublisherContext: {
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
      appConfigContext: {
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
  backgroundPublisherOptions?: BackgroundPublisherProviderWrapperOptions['backgroundPublisherContext'];
  appConfigOptions?: AppConfigProviderWrapperOptions['appConfigOptions'];
};

function render(
  ui: ReactElement,
  { previewPublisherOptions, backgroundPublisherOptions, appConfigOptions }: RenderOptions = {}
) {
  const { wrapper, ...props } = makeTestProvider(
    [
      providers.AppConfig,
      providers.User,
      providers.Session,
      providers.Publisher,
      providers.BackgroundPublisher,
      providers.PreviewPublisher,
    ],
    {
      appConfigContext: { appConfigOptions },
      previewPublisherContext: { previewPublisherOptions },
      backgroundPublisherContext: { backgroundPublisherOptions },
    }
  );

  const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <SuspenseBoundary>{wrapper({ children })}</SuspenseBoundary>
  );

  return {
    ...props,
    ...renderBase(ui, { wrapper: Wrapper }),
  };
}

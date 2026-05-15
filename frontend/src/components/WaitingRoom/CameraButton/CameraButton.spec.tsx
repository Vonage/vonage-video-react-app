import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import type { PreviewPublisherContextType } from '@Context/PreviewPublisherProvider';
import type { BackgroundPublisherContextType } from '@Context/BackgroundPublisherProvider';
import CameraButton from './CameraButton';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import composeProviders from '@web/helpers/composeProviders';
import {
  setupWindowNavigatorMock,
  makeMediaStreamMock,
  makeMediaDeviceInfos,
} from '@web-test/fixtures';
import { mediaDevices$ } from '@core/stores';
import { env } from '../../../env';

const mockDevices = makeMediaDeviceInfos();

type PreviewPublisherContextWithMock = PreviewPublisherContextType & {
  _previewToggleMockApplied?: boolean;
};

type BackgroundPublisherContextWithMock = BackgroundPublisherContextType & {
  _backgroundToggleMockApplied?: boolean;
};

describe('CameraButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.partialUpdate({
      ALLOW_CAMERA_CONTROL: true,
    });

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(mockDevices),
        getUserMedia: Promise.resolve(makeMediaStreamMock({})),
      },
    });

    // Initialize the mediaDevices$ store with mock devices to prevent useSyncPublisherDevices from disabling video
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: mockDevices,
    }));

    const { permissions } = globalThis.navigator;

    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);
  });

  it('renders the video on icon when video is enabled', async () => {
    render(<CameraButton />, {
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
    env.partialUpdate({
      ALLOW_CAMERA_CONTROL: false,
    });

    render(<CameraButton />);

    await waitFor(() => {
      expect(screen.queryByTestId('camera-button-wrapper')).not.toBeInTheDocument();
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  publisherContext?: ProviderOptions['PublisherContext'];
  backgroundPublisherContext?: ProviderOptions['BackgroundPublisherContext'];
  previewPublisherContext?: ProviderOptions['PreviewPublisherContext'];
};

function render(
  ui: ReactElement,
  {
    userContext,
    sessionContext,
    publisherContext,
    backgroundPublisherContext,
    previewPublisherContext,
  }: RenderOptions = {}
) {
  const { wrapper: ButtonWrapper, ...context } = makeTestProvider(
    [
      providers.user,
      providers.session,
      providers.publisher,
      providers.backgroundPublisher,
      providers.previewPublisher,
      providers.runtime,
    ],
    {
      userContext,
      sessionContext,
      publisherContext,
      backgroundPublisherContext,
      previewPublisherContext,
      runtimeContext: undefined,
    }
  );

  const wrapper = composeProviders(SuspenseBoundary, ButtonWrapper);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

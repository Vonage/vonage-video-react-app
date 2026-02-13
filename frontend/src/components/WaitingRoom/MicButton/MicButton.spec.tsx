import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactElement } from 'react';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import MicButton from './MicButton';
import SuspenseBoundary from '@common/components/SuspenseBoundary/SuspenseBoundary';
import composeProviders from '@common/helpers/composeProviders';
import {
  setupWindowNavigatorMock,
  makeMediaStreamMock,
  makeMediaDeviceInfos,
} from '@common-test/fixtures';
import { mediaDevices$ } from '@core/stores';

const mockDevices = makeMediaDeviceInfos();

describe('MicButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(mockDevices),
        getUserMedia: Promise.resolve(makeMediaStreamMock({})),
      },
    });

    // Initialize the mediaDevices$ store with mock devices to prevent useSyncPublisherDevices from disabling audio
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: mockDevices,
    }));

    const { permissions } = globalThis.navigator;

    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);
  });

  it('renders the mic on icon when audio is enabled', async () => {
    render(<MicButton />, {
      previewPublisherContext: {
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
      previewPublisherContext: {
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
      previewPublisherContext: {
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
      appConfigContext: {
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
  appConfigContext?: ProviderOptions['AppConfigContext'];
  userContext?: ProviderOptions['UserContext'];
  previewPublisherContext?: ProviderOptions['PreviewPublisherContext'];
};

function render(
  ui: ReactElement,
  { appConfigContext, userContext, previewPublisherContext }: RenderOptions = {}
) {
  const { wrapper: MainWrapper, ...context } = makeTestProvider(
    [providers.appConfig, providers.user, providers.previewPublisher],
    {
      appConfigContext,
      userContext,
      previewPublisherContext,
    }
  );

  const wrapper = composeProviders(SuspenseBoundary, MainWrapper);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

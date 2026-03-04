import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactElement } from 'react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import MicButton from './MicButton';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import composeProviders from '@web/helpers/composeProviders';
import { env } from '../../../env';
import {
  setupWindowNavigatorMock,
  makeMediaStreamMock,
  makeMediaDeviceInfos,
} from '@web-test/fixtures';
import { mediaDevices$ } from '@core/stores';

const mockDevices = makeMediaDeviceInfos();

describe('MicButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    env.partialUpdate({
      ALLOW_MICROPHONE_CONTROL: true,
    });

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
    env.partialUpdate({
      ALLOW_MICROPHONE_CONTROL: false,
    });

    render(<MicButton />);

    await waitFor(() => {
      expect(screen.queryByTestId('vivid-icon-microphone-line')).not.toBeInTheDocument();
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  previewPublisherContext?: ProviderOptions['PreviewPublisherContext'];
};

function render(ui: ReactElement, { userContext, previewPublisherContext }: RenderOptions = {}) {
  const { wrapper: MainWrapper, ...context } = makeTestProvider(
    [providers.user, providers.previewPublisher],
    {
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

import { render as renderBase, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Publisher, Subscriber } from '@vonage/client-sdk-video';
import type { SubscriberWrapper } from '@app-types/session';
import AdvancedSettingsStatisticsTab from './AdvancedSettingsStatisticsTab';
import makeTestProvider, { ProviderOptions, providers } from '@test/providers/makeTestProvider';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';

describe('AdvancedSettingsStatisticsTab', () => {
  vi.mock('@hooks/usePermissions', () => ({
    default: () => ({
      accessStatus: DEVICE_ACCESS_STATUS.ACCEPTED,
      setAccessStatus: vi.fn(),
    }),
  }));

  it('renders collection and an empty publisher statistics group', () => {
    render(<AdvancedSettingsStatisticsTab />);

    expect(screen.getByRole('heading', { name: /^statistics$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/enable publisher bandwidth estimate/i)).toBeInTheDocument();
    expect(screen.getAllByText(/publisher/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/statistics/i)).toBeInTheDocument();
  });

  it('renders live publisher stats when statistics are enabled', async () => {
    const publisher = {
      videoWidth: vi.fn(() => 1280),
      videoHeight: vi.fn(() => 720),
      getStats: vi.fn((callback) => {
        callback(undefined, [
          {
            stats: {
              audio: { packetsSent: 10, packetsLost: 0, bytesSent: 1024 },
              video: {
                packetsSent: 50,
                packetsLost: 1,
                bytesSent: 51200,
                frameRate: 30,
                bitrate: 3_000_000,
                connectionEstimatedBandwidthBps: 3_000_000,
                layers: [],
              },
              mediaLink: { transport: { connectionEstimatedBandwidth: 3_000_000 } },
            },
          },
        ]);
      }),
    } as unknown as Publisher;

    render(<AdvancedSettingsStatisticsTab />, {
      publisherContext: {
        __interceptor: (context) => {
          if (context) {
            context.publisher = publisher;
          }
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('30 fps')).toBeInTheDocument();
      expect(screen.getByText('1280x720')).toBeInTheDocument();
      // expect(screen.getByText('3.00 Mbps')).toBeInTheDocument();
    });
  });

  it('renders subscriber group with codec, decoded frame rate and freeze count', async () => {
    const subscriberWrapper: SubscriberWrapper = {
      id: 'sub-1',
      element: document.createElement('video'),
      isScreenshare: false,
      isPinned: false,
      subscriber: {
        stream: { name: 'Bob' },
        getStats: vi.fn((callback) => {
          callback(undefined, {
            audio: { packetsReceived: 10, packetsLost: 0, bytesReceived: 500 },
            video: {
              packetsReceived: 40,
              packetsLost: 0,
              bytesReceived: 20000,
              width: 640,
              height: 480,
              codec: 'VP9',
              frameRate: 24,
              decodedFrameRate: 23,
              bitrate: 600_000,
              freezeCount: 5,
              totalFreezesDuration: 1200,
            },
            mediaLink: {
              transport: { connectionEstimatedBandwidth: 1_000_000 },
              remotePublisherTransport: { connectionEstimatedBandwidth: 900_000 },
            },
          });
        }),
      } as unknown as Subscriber,
    };

    render(<AdvancedSettingsStatisticsTab />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = [subscriberWrapper];
          }
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('VP9')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});

type RenderOptions = {
  advancedSettingsContext?: ProviderOptions['AdvancedSettingsContext'];
  userContext?: ProviderOptions['UserContext'];
  publisherContext?: ProviderOptions['PublisherContext'];
  previewPublisherContext?: ProviderOptions['PreviewPublisherContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render(
  ui: ReactElement,
  {
    advancedSettingsContext,
    userContext,
    publisherContext,
    previewPublisherContext,
    sessionContext,
  }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider(
    [
      providers.advancedSettings,
      providers.runtime,
      providers.user,
      providers.publisher,
      providers.previewPublisher,
      providers.session,
    ],
    {
      advancedSettingsContext,
      runtimeContext: undefined,
      userContext,
      sessionContext,
      publisherContext,
      previewPublisherContext,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

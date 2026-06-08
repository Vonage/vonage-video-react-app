import { render as renderBase, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Publisher, Subscriber } from '@vonage/client-sdk-video';
import type { SubscriberWrapper } from '@app-types/session';
import advancedSettings$ from '@Context/AdvancedSettings';
import { PublisherContext } from '@Context/PublisherProvider';
import { PreviewPublisherContext } from '@Context/PreviewPublisherProvider';
import { SessionContext } from '@Context/SessionProvider/session';
import AdvancedSettingsStatisticsTab from './AdvancedSettingsStatisticsTab';

describe('AdvancedSettingsStatisticsTab', () => {
  it('renders collection and an empty publisher statistics group', () => {
    render(<AdvancedSettingsStatisticsTab />);

    expect(screen.getByRole('heading', { name: /^statistics$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/enable publisher statistics/i)).toBeInTheDocument();
    expect(screen.getAllByText(/publisher/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/no statistics available yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/subscriber/i)).not.toBeInTheDocument();
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
                layers: [],
              },
              mediaLink: { transport: { connectionEstimatedBandwidth: 3_000_000 } },
            },
          },
        ]);
      }),
    } as unknown as Publisher;

    advancedSettings$.setState((state) => ({ ...state, publisherStatisticsEnabled: true }));

    render(<AdvancedSettingsStatisticsTab />, { meetingPublisher: publisher });

    await waitFor(() => {
      expect(screen.getByText('30 fps')).toBeInTheDocument();
      expect(screen.getByText('1280x720')).toBeInTheDocument();
      expect(screen.getByText('3.00 Mbps')).toBeInTheDocument();
    });

    advancedSettings$.setState((state) => ({ ...state, publisherStatisticsEnabled: false }));
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

    render(<AdvancedSettingsStatisticsTab />, { subscriberWrappers: [subscriberWrapper] });

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('VP9')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('1.2 s')).toBeInTheDocument();
    });
  });
});

type RenderOptions = {
  meetingPublisher?: Publisher | null;
  subscriberWrappers?: SubscriberWrapper[];
};

function render(
  ui: ReactElement,
  { meetingPublisher = null, subscriberWrappers = [] }: RenderOptions = {}
) {
  const publisherContextValue = {
    publisher: meetingPublisher,
  } as unknown as typeof PublisherContext extends React.Context<infer T> ? T : never;
  const previewContextValue = {
    publisher: null,
  } as unknown as typeof PreviewPublisherContext extends React.Context<infer T> ? T : never;
  const sessionContextValue = {
    subscriberWrappers,
  } as unknown as typeof SessionContext extends React.Context<infer T> ? T : never;

  return renderBase(
    <PublisherContext.Provider value={publisherContextValue}>
      <PreviewPublisherContext.Provider value={previewContextValue}>
        <SessionContext.Provider value={sessionContextValue}>{ui}</SessionContext.Provider>
      </PreviewPublisherContext.Provider>
    </PublisherContext.Provider>
  );
}

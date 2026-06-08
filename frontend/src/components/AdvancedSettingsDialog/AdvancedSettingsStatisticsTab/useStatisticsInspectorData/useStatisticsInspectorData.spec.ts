import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Publisher, Subscriber } from '@vonage/client-sdk-video';
import type { SubscriberWrapper } from '@app-types/session';
import useStatisticsInspectorData from './useStatisticsInspectorData';

// ─── Publisher factory ────────────────────────────────────────────────────────

function makePublisher(overrides: Partial<Publisher> = {}): Publisher {
  return {
    videoWidth: vi.fn(() => 1280),
    videoHeight: vi.fn(() => 720),
    getStats: vi.fn(),
    ...overrides,
  } as unknown as Publisher;
}

function makePublisherWithStats(statsOverride: Record<string, unknown> = {}): Publisher {
  const stats: import('@vonage/client-sdk-video').PublisherStatsArr = [
    {
      stats: {
        audio: { packetsSent: 100, packetsLost: 2, bytesSent: 5000 },
        video: {
          packetsSent: 200,
          packetsLost: 4,
          bytesSent: 80000,
          frameRate: 30,
          layers: [
            {
              codec: 'VP9',
              width: 1280,
              height: 720,
              encodedFrameRate: 29,
              bitrate: 1_200_000,
              totalBitrate: 1_200_000,
              qualityLimitationReason: 'none',
            },
          ],
          ...statsOverride,
        },
        mediaLink: {
          transport: {
            connectionEstimatedBandwidth: 2_000_000,
            networkCondition: 'good',
            networkConditionReason: 'none',
          },
        },
        timestamp: 0,
        transportStats: {
          connectionEstimatedBandwidth: 2_000_000,
          networkCondition: 'good',
          networkConditionReason: 'none',
        },
      },
    },
  ];

  return makePublisher({
    getStats: vi.fn((callback) => {
      callback(undefined, stats);
    }),
  });
}

// ─── Subscriber factory ───────────────────────────────────────────────────────

function makeSubscriberWrapper(statsOverride: Record<string, unknown> = {}): SubscriberWrapper {
  const stats = {
    audio: { packetsReceived: 50, packetsLost: 1, bytesReceived: 3000 },
    video: {
      packetsReceived: 120,
      packetsLost: 3,
      bytesReceived: 60000,
      width: 640,
      height: 480,
      codec: 'VP8',
      frameRate: 25,
      decodedFrameRate: 24,
      bitrate: 800_000,
      freezeCount: 2,
      totalFreezesDuration: 350,
      ...statsOverride,
    },
    mediaLink: {
      transport: { connectionEstimatedBandwidth: 1_500_000 },
      remotePublisherTransport: { connectionEstimatedBandwidth: 1_800_000 },
    },
  };

  const subscriber = {
    stream: { name: 'Alice' },
    getStats: vi.fn((callback) => {
      callback(undefined, stats);
    }),
  } as unknown as Subscriber;

  return {
    id: 'sub-1',
    subscriber,
    element: document.createElement('video'),
    isScreenshare: false,
    isPinned: false,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useStatisticsInspectorData', () => {
  it('returns empty data when publisher stats are disabled', async () => {
    const publisher = makePublisherWithStats();

    const { result } = renderHook(() =>
      useStatisticsInspectorData({
        meetingPublisher: publisher,
        previewPublisher: null,
        subscriberWrappers: [],
        publisherStatisticsEnabled: false,
      })
    );

    await waitFor(() => {
      expect(result.current.publisher).toBeNull();
      expect(result.current.subscribers).toHaveLength(0);
    });
  });

  it('maps publisher stats fields correctly', async () => {
    const publisher = makePublisherWithStats();

    const { result } = renderHook(() =>
      useStatisticsInspectorData({
        meetingPublisher: publisher,
        previewPublisher: null,
        subscriberWrappers: [],
        publisherStatisticsEnabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.publisher).not.toBeNull();
      expect(result.current.publisher?.resolution).toEqual({ width: 1280, height: 720 });
      expect(result.current.publisher?.frameRate).toBe(30);
      expect(result.current.publisher?.audio?.packetsSent).toBe(100);
      expect(result.current.publisher?.video?.bytesSent).toBe(80000);
      expect(result.current.publisher?.connectionEstimatedBandwidthBps).toBe(2_000_000);
      expect(result.current.publisher?.videoLayers).toHaveLength(1);
    });
  });

  it('normalizes negative bandwidth to null', async () => {
    const publisher = makePublisher({
      getStats: vi.fn((callback) => {
        callback(undefined, [
          {
            stats: {
              audio: { packetsSent: 0, packetsLost: 0, bytesSent: 0 },
              video: { packetsSent: 0, packetsLost: 0, bytesSent: 0, frameRate: 0 },
              mediaLink: {
                transport: {
                  connectionEstimatedBandwidth: -1,
                  networkCondition: 'unknown',
                  networkConditionReason: 'none',
                },
              },
              timestamp: 0,
              transportStats: {
                connectionEstimatedBandwidth: -1,
                networkCondition: 'unknown',
                networkConditionReason: 'none',
              },
            },
          },
        ]);
      }),
    });

    const { result } = renderHook(() =>
      useStatisticsInspectorData({
        meetingPublisher: publisher,
        previewPublisher: null,
        subscriberWrappers: [],
        publisherStatisticsEnabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.publisher?.connectionEstimatedBandwidthBps).toBeNull();
    });
  });

  it('handles partial/undefined publisher stats without crashing', async () => {
    const publisher = makePublisher({
      getStats: vi.fn((callback) => {
        callback(undefined, [
          {
            stats: { audio: undefined, video: undefined, mediaLink: undefined },
          } as unknown as import('@vonage/client-sdk-video').PublisherStatContainer,
        ]);
      }),
    });

    const { result } = renderHook(() =>
      useStatisticsInspectorData({
        meetingPublisher: publisher,
        previewPublisher: null,
        subscriberWrappers: [],
        publisherStatisticsEnabled: true,
      })
    );

    // Should not throw and audio totals default to 0
    await waitFor(() => {
      expect(result.current.publisher?.audio?.packetsSent).toBe(0);
    });
  });

  it('prefers meetingPublisher over previewPublisher', async () => {
    const meetingPublisher = makePublisherWithStats();
    const previewPublisher = makePublisher({ getStats: vi.fn() });

    const { result } = renderHook(() =>
      useStatisticsInspectorData({
        meetingPublisher,
        previewPublisher,
        subscriberWrappers: [],
        publisherStatisticsEnabled: true,
      })
    );

    await waitFor(() => expect(result.current.publisher).not.toBeNull());

    expect(vi.mocked(previewPublisher.getStats)).not.toHaveBeenCalled();
  });

  it('maps subscriber stats including codec and freeze metrics', async () => {
    const subscriberWrapper = makeSubscriberWrapper();

    const { result } = renderHook(() =>
      useStatisticsInspectorData({
        meetingPublisher: null,
        previewPublisher: null,
        subscriberWrappers: [subscriberWrapper],
        publisherStatisticsEnabled: false,
      })
    );

    await waitFor(() => {
      expect(result.current.subscribers).toHaveLength(1);
      const sub = result.current.subscribers[0];
      expect(sub.title).toBe('Alice');
      expect(sub.video.codec).toBe('VP8');
      expect(sub.video.decodedFrameRate).toBe(24);
      expect(sub.video.freezeCount).toBe(2);
      expect(sub.video.totalFreezesDuration).toBe(350);
      expect(sub.connectionEstimatedBandwidthBps).toBe(1_500_000);
      expect(sub.remotePublisherConnectionEstimatedBandwidthBps).toBe(1_800_000);
    });
  });

  it('skips subscribers whose getStats returns an error', async () => {
    const failingWrapper = makeSubscriberWrapper();
    vi.mocked(failingWrapper.subscriber.getStats).mockImplementation((callback) => {
      callback(new Error('stats unavailable'), undefined);
    });

    const { result } = renderHook(() =>
      useStatisticsInspectorData({
        meetingPublisher: null,
        previewPublisher: null,
        subscriberWrappers: [failingWrapper],
        publisherStatisticsEnabled: false,
      })
    );

    await waitFor(() => {
      expect(result.current.subscribers).toHaveLength(0);
    });
  });

  it('calculates packet loss ratio from video packets', async () => {
    const subscriberWrapper = makeSubscriberWrapper({
      packetsReceived: 97,
      packetsLost: 3,
    });

    const { result } = renderHook(() =>
      useStatisticsInspectorData({
        meetingPublisher: null,
        previewPublisher: null,
        subscriberWrappers: [subscriberWrapper],
        publisherStatisticsEnabled: false,
      })
    );

    await waitFor(() => {
      expect(result.current.subscribers[0]?.packetLossRatio).toBeCloseTo(0.03);
    });
  });
});

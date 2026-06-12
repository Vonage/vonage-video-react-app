import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Subscriber, SubscriberStats } from '@vonage/client-sdk-video';
import { runtime$ } from '@core/stores';
import useSubscriberStats from '.';
import { SubscriberInspectorStatistics } from './useSubscriberStats';

vi.mock('@core/stores', async () => {
  const actual = await vi.importActual<typeof import('@core/stores')>('@core/stores');

  return {
    ...actual,
    runtime$: {
      ...actual.runtime$,
      useQuery: vi.fn(),
    },
  };
});

function makeSubscriber(stats: SubscriberStats | null, error?: Error): Subscriber {
  return {
    id: 'subscriber-1',
    stream: {
      name: 'Test Subscriber',
    },
    getStats: vi.fn((callback) => {
      callback(error ?? null, stats);
    }),
  } as unknown as Subscriber;
}

async function executeQueryFn(subscriber: Subscriber | null) {
  let queryFn: (() => Promise<unknown>) | undefined;

  (runtime$.useQuery as Mock).mockImplementation((options) => {
    queryFn = options.queryFn;
    return {};
  });

  renderHook(() => useSubscriberStats({ subscriber }));

  return queryFn?.();
}

describe('useSubscriberStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when subscriber is null', async () => {
    const result = await executeQueryFn(null);

    expect(result).toBeNull();
  });

  it('returns null when getStats returns error', async () => {
    const subscriber = makeSubscriber(null, new Error('stats error'));

    const result = await executeQueryFn(subscriber);

    expect(result).toBeNull();
  });

  it('returns subscriber statistics', async () => {
    const subscriber = makeSubscriber({
      audio: {
        packetsReceived: 100,
        packetsLost: 2,
        bytesReceived: 1000,
      },
      video: {
        packetsReceived: 200,
        packetsLost: 4,
        bytesReceived: 2000,
        codec: 'H264',
        frameRate: 30,
        decodedFrameRate: 30,
        bitrate: 500000,
      },
      mediaLink: {
        transport: {
          connectionEstimatedBandwidth: 1000000,
        },
      },
    } as SubscriberStats);

    const result = await executeQueryFn(subscriber);

    expect(result).toMatchObject({
      id: 'subscriber-1',
      title: 'Test Subscriber',
    });
  });

  it('returns fallback bandwidth when value is negative', async () => {
    const subscriber = makeSubscriber({
      audio: {},
      video: {},
      mediaLink: {
        transport: {
          connectionEstimatedBandwidth: -1,
        },
      },
    } as SubscriberStats);

    const result = (await executeQueryFn(subscriber)) as SubscriberInspectorStatistics;

    expect(result.packetLossRatio.toString()).toBe('-');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { renderHook as renderHookBase, waitFor } from '@testing-library/react';
import type { Subscriber, SubscriberStats } from '@vonage/client-sdk-video';
import useSubscriberStats, { SubscriberInspectorStatistics } from './useSubscriberStats';
import { ProviderOptions, makeTestProvider, providers } from '@core-test';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import { composeProviders } from '@web/helpers';
import { StrictMode } from 'react';
import { type UseQueryResult } from '@tanstack/react-query';
import { wait } from '@common/execution';

describe('useSubscriberStats', () => {
  it('returns null when subscriber is null or getStats returns error', async () => {
    expect.assertions(2);

    let subscriber = makeSubscriber(null, undefined);

    let { result } = renderHook(() => useSubscriberStats({ subscriber }));

    let data = await waitForStatsToLoad(result);

    expect(data).toBeNull();

    subscriber = makeSubscriber(null, new Error('stats error'));

    ({ result } = renderHook(() => useSubscriberStats({ subscriber })));

    data = await waitForStatsToLoad(result);

    expect(data).toBeNull();
  });

  it('returns subscriber statistics', async () => {
    expect.assertions(8);

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

    const { result } = renderHook(() => useSubscriberStats({ subscriber }));

    const data = await waitForStatsToLoad(result);

    expect(data).toMatchObject({
      id: 'subscriber-1',
      title: 'Test Subscriber',
    });

    expect(data.audio.bytesReceived.toString()).toBe('1,000');
    expect(data.video.codec).toBe('H264');
    expect(data.video.frameRate.toString()).toBe('30 fps');
    expect(data.video.decodedFrameRate.toString()).toBe('30 fps');
    expect(data.video.bitrateBps.toString()).toBe('500.0 kbps');
    expect(data.packetLossRatio.toString()).toBe('1.96%');
    expect(data.connectionEstimatedBandwidthBps.toString()).toBe('1.00 Mbps');
  });

  it('returns fallback bandwidth when value is negative', async () => {
    expect.assertions(1);

    const subscriber = makeSubscriber({
      audio: {},
      video: {},
      mediaLink: {
        transport: {
          connectionEstimatedBandwidth: -1,
        },
      },
    } as SubscriberStats);

    const { result } = renderHook(() => useSubscriberStats({ subscriber }));

    const data = await waitForStatsToLoad(result);

    expect(data.packetLossRatio.toString()).toBe('-');
  });
});

function makeSubscriber(stats: SubscriberStats | null, error?: Error): Subscriber {
  return {
    id: 'subscriber-1',
    stream: {
      name: 'Test Subscriber',
    },
    getStats: vi.fn(async (callback) => {
      await wait(1);

      callback(error ?? null, stats);
    }),
  } as unknown as Subscriber;
}

async function waitForStatsToLoad(args: {
  current: UseQueryResult<SubscriberInspectorStatistics | null, unknown>;
}) {
  await waitFor(() => {
    if (args.current.isLoading || args.current.isFetching) {
      throw new Error('Still loading');
    }

    if (args.current.data === undefined) {
      throw new Error('Stats not loaded');
    }
  });

  return args.current.data!;
}
type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  { runtimeContext }: RenderOptions = {}
) {
  const { wrapper: MainWrapper, ...context } = makeTestProvider([providers.runtime], {
    runtimeContext,
  });

  const wrapper = composeProviders(StrictMode, SuspenseBoundary, MainWrapper);
  const result = renderHookBase(render, { wrapper });

  return {
    ...context,
    ...result,
  };
}

import { describe, expect, it, vi } from 'vitest';
import { renderHook as renderHookBase, waitFor, act } from '@testing-library/react';
import type { Publisher, PublisherStatsArr, VideoLayerStats } from '@vonage/client-sdk-video';
import usePublisherStats, { PublisherInspectorStatistics } from './usePublisherStats';
import { wait } from '@common/execution';
import { ProviderOptions, makeTestProvider, providers } from '@core-test';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import { composeProviders } from '@web/helpers';
import { StrictMode } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { DeepPartial } from '@common/types';

describe('usePublisherStats', () => {
  describe('resolution', () => {
    it('maps valid publisher dimensions and video frame rate', async () => {
      expect.assertions(2);

      const publisher = makePublisher(
        [
          makeStatsContainer({
            video: {
              frameRate: 30,
            },
          }),
        ],
        {
          videoWidth: 1280,
          videoHeight: 720,
        }
      );

      const { result } = renderHook(() =>
        usePublisherStats({
          publisher,
          publisherStatisticsEnabled: true,
          fixedFrameRate: 30,
          queryOptions: {
            refetchInterval: false,
          },
        })
      );

      const stats = await waitForStatsToLoad(result);

      // optionalValue wraps the value; the fallback '-' should NOT be used
      expect(stats.resolution.value).toEqual({
        width: 1280,
        height: 720,
      });

      expect(stats.frameRate.value).toBe(30);
    });
  });

  describe('frameRate', () => {
    it('does NOT treat 0 fps as missing because it is a valid value', async () => {
      expect.assertions(1);

      const publisher = makePublisher([
        makeStatsContainer({
          video: {
            frameRate: 0,
          },
        }),
      ]);

      const { result } = renderHook(() =>
        usePublisherStats({
          publisher,
          publisherStatisticsEnabled: true,
          fixedFrameRate: 0,
          queryOptions: {
            refetchInterval: false,
          },
        })
      );

      const stats = await waitForStatsToLoad(result);

      // 0 fps is a real value; the formatted output should not be the fallback '-'
      expect(stats.frameRate.value).toBe(0);
    });
  });

  describe('bitrateBps', () => {
    it('calculates bitrate correctly when a previous sample is available', async () => {
      expect.assertions(3);

      const publisher = makePublisher([
        makeStatsContainer({
          video: {
            bytesSent: 0,
          },
          timestamp: 0,
        }),
      ]);

      const { result } = renderHook(() =>
        usePublisherStats({
          publisher,
          publisherStatisticsEnabled: true,
          queryOptions: {
            refetchInterval: false,
            staleTime: 0,
          },
        })
      );

      let data = await waitForStatsToLoad(result);

      // first render there is no previous sample, so the bitrate should be the fallback '-'
      expect(data.bitrateBps.toString()).toBe('-');

      vi.spyOn(publisher, 'getStats').mockImplementationOnce((callback) => {
        callback(undefined, [
          makeStatsContainer({
            video: {
              bytesSent: 1000,
            },
            timestamp: 1000,
          }),
        ]);
      });

      await act(async () => {
        await result.current.refetch();
      });

      data = await waitForStatsToLoad(result);

      expect(data.bitrateBps.toString()).toBe('8.0 kbps');

      expect(data.bitrateBps.value).toBe(8000);
    });
  });

  describe('packetLossRatio', () => {
    it('calculates packet loss ratio from aggregated video packet totals', async () => {
      expect.assertions(3);

      // 4 lost out of 204 total means ~1.96 %
      const container1 = makeStatsContainer({
        video: {
          packetsSent: 100,
          packetsLost: 2,
        },
      });

      const container2 = makeStatsContainer({
        video: {
          packetsSent: 100,
          packetsLost: 2,
        },
      });

      const publisher = makePublisher([container1, container2]);

      const { result } = renderHook(() =>
        usePublisherStats({
          publisher,
          publisherStatisticsEnabled: true,
          queryOptions: {
            refetchInterval: false,
          },
        })
      );

      const stats = await waitForStatsToLoad(result);

      expect(stats.video.packetsSent.value).toBe(200);
      expect(stats.video.packetsLost.value).toBe(4);
      expect(stats.packetLossRatio.value).toBeCloseTo(4 / 204);
    });
  });

  describe('connectionEstimatedBandwidthBps', () => {
    it('picks the maximum valid bandwidth across multiple containers when publisherStatisticsEnabled is true', async () => {
      expect.assertions(1);

      const container1 = makeStatsContainer({
        mediaLink: {
          transport: {
            connectionEstimatedBandwidth: -1,
          },
        },
      });

      const container2 = makeStatsContainer({
        mediaLink: {
          transport: {
            connectionEstimatedBandwidth: 500_000,
          },
        },
      });

      const container3 = makeStatsContainer({
        mediaLink: {
          transport: {
            connectionEstimatedBandwidth: 2_000_000,
          },
        },
      });

      const publisher = makePublisher([container1, container2, container3]);

      const { result } = renderHook(() =>
        usePublisherStats({
          publisher,
          publisherStatisticsEnabled: true,
          queryOptions: {
            refetchInterval: false,
          },
        })
      );

      const stats = await waitForStatsToLoad(result);

      expect(stats.connectionEstimatedBandwidthBps.value).toBe(2_000_000);
    });

    it('returns fallback when publisherStatisticsEnabled is false', async () => {
      expect.assertions(1);

      const publisher = makePublisher([
        makeStatsContainer({
          mediaLink: {
            transport: {
              connectionEstimatedBandwidth: 2_000_000,
            },
          },
        }),
      ]);

      const { result } = renderHook(() =>
        usePublisherStats({
          publisher,
          publisherStatisticsEnabled: false,
          queryOptions: {
            refetchInterval: false,
          },
        })
      );

      const stats = await waitForStatsToLoad(result);

      expect(stats.connectionEstimatedBandwidthBps.toString()).toBe('-');
    });
  });

  describe('videoLayers', () => {
    it('returns videoLayers from the first stats container', async () => {
      expect.assertions(1);

      const layers = [
        {
          spatialLayerId: 0,
        },
        {
          spatialLayerId: 1,
        },
      ] as unknown as VideoLayerStats[];

      const publisher = makePublisher([
        makeStatsContainer({
          video: {
            layers,
          },
        }),
      ]);

      const { result } = renderHook(() =>
        usePublisherStats({
          publisher,
          publisherStatisticsEnabled: true,
          queryOptions: {
            refetchInterval: false,
          },
        })
      );

      const stats = await waitForStatsToLoad(result);

      expect(stats.videoLayers).toEqual(layers);
    });

    it('returns null when video layers are absent', async () => {
      expect.assertions(1);

      const containerWithoutLayers = {
        stats: {
          timestamp: 0,
          audio: {
            packetsSent: 100,
            packetsLost: 0,
            bytesSent: 1000,
          },
          video: {
            packetsSent: 100,
            packetsLost: 0,
            bytesSent: 5000,
            frameRate: 30,
          },
          mediaLink: {
            transport: {
              connectionEstimatedBandwidth: 1_000_000,
            },
          },
        },
      } as unknown as PublisherStatsArr[number];

      const publisher = makePublisher([containerWithoutLayers]);

      const { result } = renderHook(() =>
        usePublisherStats({
          publisher,
          publisherStatisticsEnabled: true,
          queryOptions: {
            refetchInterval: false,
          },
        })
      );

      const stats = await waitForStatsToLoad(result);

      expect(stats.videoLayers).toBeNull();
    });
  });

  describe('missing / partial track data', () => {
    it('treats missing audio track fields as zero', async () => {
      expect.assertions(3);

      const containerWithNoAudio = {
        stats: {
          timestamp: 0,
          audio: {},
          video: {
            packetsSent: 100,
            packetsLost: 0,
            bytesSent: 5000,
            frameRate: 30,
            layers: [],
          },
          mediaLink: {
            transport: {
              connectionEstimatedBandwidth: 1_000_000,
            },
          },
        },
      } as unknown as PublisherStatsArr[number];

      const publisher = makePublisher([containerWithNoAudio]);

      const { result } = renderHook(() =>
        usePublisherStats({
          publisher,
          publisherStatisticsEnabled: true,
          queryOptions: {
            refetchInterval: false,
          },
        })
      );

      const stats = await waitForStatsToLoad(result);

      expect(stats.audio.packetsSent.value).toBe(0);
      expect(stats.audio.packetsLost.value).toBe(0);
      expect(stats.audio.bytesSent.value).toBe(0);
    });
  });
});

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

async function waitForStatsToLoad(args: {
  current: UseQueryResult<PublisherInspectorStatistics | null, unknown>;
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

/**
 * Builds a minimal Publisher mock whose getStats callback resolves with the
 * provided stats array or an error when `error` is truthy.
 */
function makePublisher(
  statsArr: PublisherStatsArr | null = null,
  options: { error?: Error; videoWidth?: number; videoHeight?: number } = {}
): Publisher {
  return {
    id: 'publisher-id-1',
    videoWidth: vi.fn().mockReturnValue(options.videoWidth ?? 1280),
    videoHeight: vi.fn().mockReturnValue(options.videoHeight ?? 720),
    getStats: vi.fn(
      async (callback: (error: Error | null, stats: PublisherStatsArr | null) => void) => {
        await wait(1);

        callback(options.error ?? null, statsArr);
      }
    ),
  } as unknown as Publisher;
}

/**
 * Builds a minimal PublisherStatsArr entry.
 */
function makeStatsContainer(
  stats: DeepPartial<PublisherStatsArr[0]['stats']> = {}
): PublisherStatsArr[0] {
  return {
    stats: {
      timestamp: stats.timestamp ?? 0,
      audio: {
        packetsSent: 100,
        packetsLost: 2,
        bytesSent: 5000,
        ...stats.audio,
      },
      video: {
        packetsSent: 200,
        packetsLost: 4,
        bytesSent: 20000,
        frameRate: 30,
        layers: [],
        ...stats.video,
      },
      mediaLink: {
        transport: {
          connectionEstimatedBandwidth: 1_000_000,
          ...stats.mediaLink?.transport,
        },
      },
    },
  } as unknown as PublisherStatsArr[number];
}

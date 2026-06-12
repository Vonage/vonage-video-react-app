import { runtime$ } from '@core/stores';
import type { QueryOptions } from '@core/types';
import {
  BitrateValue,
  FrameRateValue,
  IntegerValue,
  optionalValue,
  OptionalValue,
  PacketLossValue,
  ResolutionValue,
} from '@core/metrics';
import type { Publisher, VideoLayerStats } from '@vonage/client-sdk-video';
import useStableRef from '@web/hooks/useStableRef/useStableRef';
import {
  aggregateOutgoingTrackTotals,
  calculateBitrateFromDelta,
  calculatePacketLossRatio,
  readPublisherFrameRate,
  readPublisherResolution,
  readPublisherStatsSafely,
} from './usePublisherStats.utils';

const POLL_INTERVAL_MS = 2000;

export type OutgoingTrackTotals = {
  packetsSent: IntegerValue;
  packetsLost: IntegerValue;
  bytesSent: IntegerValue;
};

export type PublisherInspectorStatistics = {
  resolution: OptionalValue<ResolutionValue>;
  frameRate: OptionalValue<FrameRateValue>;
  bitrateBps: OptionalValue<BitrateValue>;
  packetLossRatio: OptionalValue<PacketLossValue>;
  audio: OutgoingTrackTotals;
  video: OutgoingTrackTotals;
  connectionEstimatedBandwidthBps: OptionalValue<BitrateValue>;
  videoLayers: VideoLayerStats[] | null;
};

export type UsePublisherStatsProps<TData = PublisherInspectorStatistics> = {
  queryOptions?: QueryOptions<PublisherInspectorStatistics | null, TData>;
  publisher: Publisher | null | undefined;
  publisherStatisticsEnabled: boolean;
};

const usePublisherStats = <Selected = PublisherInspectorStatistics | null>({
  queryOptions,
  publisher,
  publisherStatisticsEnabled,
}: UsePublisherStatsProps<Selected>) => {
  const previousPublisherVideoSampleRef = useStableRef<{
    bytesSent: number;
    timestamp: number;
  } | null>(() => null, []);

  return runtime$.useQuery({
    queryKey: ['publisherStats', publisher?.id, publisherStatisticsEnabled],
    refetchInterval: POLL_INTERVAL_MS,
    queryFn: async () => {
      if (!publisher) {
        return null;
      }

      const publisherStatsContainers = await readPublisherStatsSafely(publisher);

      if (!publisherStatsContainers || publisherStatsContainers.length === 0) {
        return null;
      }

      const audioTotals = aggregateOutgoingTrackTotals(
        publisherStatsContainers,
        (container) => container.stats.audio
      );

      const videoTotals = aggregateOutgoingTrackTotals(
        publisherStatsContainers,
        (container) => container.stats.video
      );

      const firstPublisherStatsContainer = publisherStatsContainers[0];
      const frameRate = readPublisherFrameRate(firstPublisherStatsContainer?.stats);
      const resolution = readPublisherResolution(publisher);
      const connectionEstimatedBandwidthValues = publisherStatsContainers
        .map((container) => container.stats.mediaLink?.transport?.connectionEstimatedBandwidth)
        .filter((value): value is number => typeof value === 'number');
      const connectionEstimatedBandwidthBps = (() => {
        if (connectionEstimatedBandwidthValues.length === 0) {
          return null;
        }

        const maxBandwidth = Math.max(...connectionEstimatedBandwidthValues);
        return maxBandwidth === undefined || maxBandwidth < 0 ? null : maxBandwidth;
      })();
      const packetLossRatio = calculatePacketLossRatio({
        packetsLost: videoTotals.packetsLost,
        packetsSuccessful: videoTotals.packetsSent,
      });

      const currentTimestamp = Date.now();
      // Bitrate is intentionally null on the first poll because we need two samples
      // to compute a delta. It will resolve on the second tick (~1s after panel open).
      const bitrateBps = calculateBitrateFromDelta({
        currentBytesSent: videoTotals.bytesSent.value,
        currentTimestamp,
        previousSample: previousPublisherVideoSampleRef.current,
      });

      previousPublisherVideoSampleRef.current = {
        bytesSent: videoTotals.bytesSent.value,
        timestamp: currentTimestamp,
      };

      return {
        resolution: optionalValue(ResolutionValue, resolution, { fallback: '-' }),
        frameRate: optionalValue(FrameRateValue, frameRate, { fallback: '-' }),
        bitrateBps: optionalValue(BitrateValue, bitrateBps, { fallback: '-' }),
        packetLossRatio: optionalValue(PacketLossValue, packetLossRatio, { fallback: '-' }),
        audio: audioTotals,
        video: videoTotals,
        connectionEstimatedBandwidthBps: optionalValue(
          BitrateValue,
          publisherStatisticsEnabled ? connectionEstimatedBandwidthBps : null,
          { fallback: '-' }
        ),
        videoLayers: firstPublisherStatsContainer?.stats.video?.layers ?? null,
      };
    },
    ...queryOptions,
  });
};

export default usePublisherStats;

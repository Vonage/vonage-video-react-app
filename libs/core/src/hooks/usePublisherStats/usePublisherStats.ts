import { runtime$ } from '@core/stores';
import type { QueryOptions } from '@core/types';
import {
  BitrateValue,
  FrameRateValue,
  integerValue,
  IntegerValue,
  optionalValue,
  OptionalValue,
  PacketLossValue,
  ResolutionValue,
} from '@core/metrics';
import type {
  Publisher,
  PublisherStats,
  PublisherStatsArr,
  VideoLayerStats,
} from '@vonage/client-sdk-video';
import useStableRef from '@web/hooks/useStableRef/useStableRef';

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

function calculateBitrateFromDelta({
  currentBytesSent,
  currentTimestamp,
  previousSample,
}: {
  currentBytesSent: number;
  currentTimestamp: number;
  previousSample: { bytesSent: number; timestamp: number } | null;
}): number | null {
  if (!previousSample) {
    return null;
  }

  const elapsedMilliseconds = currentTimestamp - previousSample.timestamp;
  const deltaBytes = currentBytesSent - previousSample.bytesSent;

  if (elapsedMilliseconds <= 0 || deltaBytes < 0) {
    return null;
  }

  return Math.round((deltaBytes * 8 * 1000) / elapsedMilliseconds);
}

function readPublisherFrameRate(stats?: PublisherStats): number | null {
  const frameRate = stats?.video?.frameRate;

  if (frameRate === null || frameRate === undefined) {
    return null;
  }

  return frameRate;
}

function readPublisherResolution(publisher: Publisher): { width: number; height: number } | null {
  const width = publisher.videoWidth();
  const height = publisher.videoHeight();

  if (width == null || height == null) {
    return null;
  }

  return { width, height };
}

function aggregateOutgoingTrackTotals(
  publisherStatsContainers: PublisherStatsArr,
  getTrack: (container: PublisherStatsArr[number]) => {
    packetsSent?: number;
    packetsLost?: number;
    bytesSent?: number;
  }
): OutgoingTrackTotals {
  return publisherStatsContainers.reduce<OutgoingTrackTotals>(
    (accumulator, container) => {
      const track = getSafeOutgoingTrackTotals(getTrack(container));

      return {
        packetsSent: integerValue(accumulator.packetsSent.value + track.packetsSent.value),
        packetsLost: integerValue(accumulator.packetsLost.value + track.packetsLost.value),
        bytesSent: integerValue(accumulator.bytesSent.value + track.bytesSent.value),
      };
    },
    { packetsSent: integerValue(0), packetsLost: integerValue(0), bytesSent: integerValue(0) }
  );
}

function getSafeOutgoingTrackTotals(track?: {
  packetsSent?: number;
  packetsLost?: number;
  bytesSent?: number;
}): OutgoingTrackTotals {
  return {
    packetsSent: integerValue(track?.packetsSent ?? 0),
    packetsLost: integerValue(track?.packetsLost ?? 0),
    bytesSent: integerValue(track?.bytesSent ?? 0),
  };
}

function readPublisherStatsSafely(publisher: Publisher): Promise<PublisherStatsArr | null> {
  return new Promise((resolve) => {
    publisher.getStats((error, stats) => {
      if (error || !stats) {
        resolve(null);
        return;
      }

      resolve(stats);
    });
  });
}

function calculatePacketLossRatio({
  packetsLost,
  packetsSuccessful,
}: {
  packetsLost: IntegerValue;
  packetsSuccessful: IntegerValue;
}): number | null {
  const totalPackets = packetsLost.value + packetsSuccessful.value;

  if (totalPackets <= 0) {
    return null;
  }

  return packetsLost.value / totalPackets;
}

export default usePublisherStats;

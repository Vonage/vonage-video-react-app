import { runtime$ } from '@core/stores';
import type { QueryOptions } from '@core/types';
import {
  BitrateValue,
  bytesValue,
  BytesValue,
  FrameRateValue,
  IntegerValue,
  integerValue,
  optionalValue,
  OptionalValue,
  PacketLossValue,
  ResolutionValue,
} from '@core/metrics';
import type { Publisher, PublisherStatsArr, VideoLayerStats } from '@vonage/client-sdk-video';
import useStableRef from '@web/hooks/useStableRef/useStableRef';
import { isNil } from '@common/assertions';

const POLL_INTERVAL_MS = 2000;

export type OutgoingTrackTotals = {
  packetsSent: IntegerValue;
  packetsLost: IntegerValue;
  bytesSent: BytesValue;
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
  fixedFrameRate?: number | null;
};

const usePublisherStats = <Selected = PublisherInspectorStatistics | null>({
  queryOptions,
  publisher,
  publisherStatisticsEnabled,
  fixedFrameRate,
}: UsePublisherStatsProps<Selected>) => {
  const previousPublisherVideoSampleRef = useStableRef<PreviousPublisherVideoSample | null>(
    () => null,
    []
  );

  return runtime$.useQuery({
    queryKey: ['publisherStats', publisher?.id, publisherStatisticsEnabled],
    refetchInterval: POLL_INTERVAL_MS,
    queryFn: async () => {
      if (!publisher) return null;

      const publisherStatsContainers = await getPublisherStats(publisher);
      if (!publisherStatsContainers?.length) return null;

      const audioTotals = aggregateOutgoingTrackTotals(
        publisherStatsContainers,
        (container) => container.stats.audio
      );

      const videoTotals = aggregateOutgoingTrackTotals(
        publisherStatsContainers,
        (container) => container.stats.video
      );

      const firstPublisherStatsContainer = publisherStatsContainers[0];
      const stats = firstPublisherStatsContainer?.stats;

      const frameRate = fixedFrameRate ?? null;

      const width = publisher.videoWidth();
      const height = publisher.videoHeight();
      const resolution = isNil(width) || isNil(height) ? null : { width, height };

      const connectionEstimatedBandwidthValues = publisherStatsContainers
        .map((container) => container.stats.mediaLink?.transport?.connectionEstimatedBandwidth)
        .filter((value): value is number => typeof value === 'number' && value >= 0);

      const connectionEstimatedBandwidthBps = connectionEstimatedBandwidthValues?.length
        ? Math.max(...connectionEstimatedBandwidthValues)
        : null;

      const packetLossRatio = calculatePacketLossRatio({
        packetsLost: videoTotals.packetsLost,
        packetsSuccessful: videoTotals.packetsSent,
      });

      // Bitrate is intentionally null on the first poll because we need two samples
      // to compute a delta. It will resolve on the second tick.
      const bitrateBps = calculateBitrateFromDelta({
        currentBytesSent: videoTotals.bytesSent.value,
        currentTimestamp: stats.timestamp,
        previousSample: previousPublisherVideoSampleRef.current,
      });

      previousPublisherVideoSampleRef.current = {
        bytesSent: videoTotals.bytesSent,
        timestamp: stats.timestamp,
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
        videoLayers: stats?.video?.layers ?? null,
      };
    },
    ...queryOptions,
  });
};

type PreviousPublisherVideoSample = {
  bytesSent: BytesValue;
  timestamp: number;
};

function getPublisherStats(publisher: Publisher): Promise<PublisherStatsArr | null> {
  return new Promise((resolve) => {
    publisher.getStats((error, stats) => {
      if (error) return resolve(null);
      resolve(stats ?? null);
    });
  });
}

function aggregateOutgoingTrackTotals(
  publisherStatsContainers: PublisherStatsArr,
  getTrack: (container: PublisherStatsArr[number]) => {
    packetsSent: number;
    packetsLost: number;
    bytesSent: number;
  }
): OutgoingTrackTotals {
  return publisherStatsContainers.reduce<OutgoingTrackTotals>(
    (accumulator, container) => {
      const track = getTrack(container);

      return {
        packetsSent: integerValue(accumulator.packetsSent.value + (track?.packetsSent ?? 0)),
        packetsLost: integerValue(accumulator.packetsLost.value + (track?.packetsLost ?? 0)),
        bytesSent: bytesValue(accumulator.bytesSent.value + (track?.bytesSent ?? 0)),
      };
    },
    {
      packetsSent: integerValue(0),
      packetsLost: integerValue(0),
      bytesSent: bytesValue(0),
    }
  );
}

function calculateBitrateFromDelta({
  currentBytesSent,
  currentTimestamp,
  previousSample,
}: {
  currentBytesSent: number;
  currentTimestamp: number;
  previousSample: PreviousPublisherVideoSample | null;
}): number | null {
  if (!previousSample) return null;

  const elapsedMilliseconds = currentTimestamp - previousSample.timestamp;
  const deltaBytes = currentBytesSent - previousSample.bytesSent.value;

  const canCalculateBitrate = elapsedMilliseconds > 0 && deltaBytes >= 0;
  if (!canCalculateBitrate) return null;

  return Math.round((deltaBytes * 8 * 1000) / elapsedMilliseconds);
}

function calculatePacketLossRatio({
  packetsLost,
  packetsSuccessful,
}: {
  packetsLost: IntegerValue;
  packetsSuccessful: IntegerValue;
}): number | null {
  const totalPackets = packetsLost.value + packetsSuccessful.value;
  if (totalPackets <= 0) return null;

  return packetsLost.value / totalPackets;
}

export default usePublisherStats;

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
  NetworkConditionValue,
  NetworkConditionReasonValue,
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
  network: {
    score: OptionalValue<NetworkConditionValue>;
    reason: OptionalValue<NetworkConditionReasonValue>;
  };
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

      /**
       * `videoWidth`/`videoHeight` report the *captured* video. They already account for a browser
       * refusing the requested resolution, but not for the encoder scaling down under CPU or
       * bandwidth pressure - so on a constrained connection they read 1280x720 while 640x360 is
       * being sent, which is precisely the case this panel exists to diagnose.
       *
       * `layers[].width/height` are the encoded dimensions ("Encoded dimensions" in the client
       * observability guide), so they are preferred, with the captured size kept as the fallback
       * for publishers that report no layers.
       */
      const capturedWidth = publisher.videoWidth();
      const capturedHeight = publisher.videoHeight();
      const capturedResolution =
        isNil(capturedWidth) || isNil(capturedHeight)
          ? null
          : { width: capturedWidth, height: capturedHeight };

      const resolution = readHighestLayerResolution(stats?.video?.layers) ?? capturedResolution;

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
        network: {
          score: optionalValue(
            NetworkConditionValue,
            stats?.mediaLink?.transport?.networkCondition,
            { fallback: '-' }
          ),
          reason: optionalValue(
            NetworkConditionReasonValue,
            stats?.mediaLink?.transport?.networkConditionReason,
            { fallback: '-' }
          ),
        },
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

/**
 * Encoded dimensions of the largest active layer, which is what a well-connected subscriber
 * receives. Layers are compared by area so the ordering of the array does not matter.
 * @param {VideoLayerStats[] | undefined} layers - the publisher's active encoding layers
 * @returns {{ width: number; height: number } | null} the largest encoded size, or null when no
 * layer reports usable dimensions
 */
function readHighestLayerResolution(
  layers: VideoLayerStats[] | undefined
): { width: number; height: number } | null {
  const sizes = (layers ?? [])
    .map((layer) => ({ width: layer.width, height: layer.height }))
    .filter((size) => typeof size.width === 'number' && typeof size.height === 'number')
    .filter((size) => size.width > 0 && size.height > 0);

  if (!sizes.length) return null;

  return sizes.reduce((largest, size) =>
    size.width * size.height > largest.width * largest.height ? size : largest
  );
}

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

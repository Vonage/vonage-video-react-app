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
import tryCatch from '@common/execution/tryCatch';

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

      /**
       * Routed sessions report a single object for the stream sent to the Media Router. Relayed
       * sessions report one per subscriber, so the per-stream figures below - frame rate, network
       * condition, timestamp - describe the first subscriber rather than an average. Totals are
       * aggregated across all of them above.
       */
      const firstPublisherStatsContainer = publisherStatsContainers[0];
      const stats = firstPublisherStatsContainer?.stats;

      /**
       * Prefer what is actually being sent. `fixedFrameRate` is only the value the publisher was
       * asked for, so it reads as a plausible number for the camera - whose setting always has a
       * value - and as nothing at all for a screen share, whose frame rate defaults to the browser
       * default. It is kept as a last resort for the window before any stats arrive.
       *
       * Two Vonage sources disagree on where the frame rate lives: the Publisher reference
       * documents `video.frameRate` ("current average video frame rate"), while the client
       * observability guide lists only bytes/packets/layers and puts it in
       * `layers[].encodedFrameRate` ("actual encoding frame rate for this layer"). Both are read,
       * highest layer first, so simulcast and single-layer publishers behave the same.
       */
      const frameRate =
        stats?.video?.frameRate ??
        readHighestLayerFrameRate(stats?.video?.layers) ??
        readTrackFrameRate(publisher) ??
        fixedFrameRate ??
        null;

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
 * Highest per-layer encoding frame rate, which is where the client observability guide says the
 * real rate lives. With simulcast the layers differ, and the top one is what a well-connected
 * subscriber receives.
 * @param {VideoLayerStats[] | undefined} layers - the publisher's active encoding layers
 * @returns {number | null} the highest encoded frame rate, or null when there are no layers
 */
function readHighestLayerFrameRate(layers: VideoLayerStats[] | undefined): number | null {
  const frameRates = (layers ?? [])
    .map((layer) => layer.encodedFrameRate)
    .filter((frameRate): frameRate is number => typeof frameRate === 'number');

  return frameRates.length ? Math.max(...frameRates) : null;
}

/**
 * Frame rate straight off the outgoing track, for the window before the SDK reports stats - a
 * screen share reports its capture rate here as soon as the picker closes.
 * @param {Publisher} publisher - the publisher to read from
 * @returns {number | null} the track's frame rate, or null when it cannot be read
 */
function readTrackFrameRate(publisher: Publisher): number | null {
  // getVideoSource throws while the publisher is still initializing.
  const { result } = tryCatch(() => publisher.getVideoSource()?.track?.getSettings().frameRate);

  return result ?? null;
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

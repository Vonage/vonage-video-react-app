import { runtime$ } from '@core/stores';
import type { QueryOptions } from '@core/types';
import {
  BitrateValue,
  ResolutionValue,
  FrameRateValue,
  integerValue,
  IntegerValue,
  OptionalValue,
  optionalValue,
  PacketLossValue,
} from '@core/metrics';
import type { Subscriber, SubscriberStats } from '@vonage/client-sdk-video';

const POLL_INTERVAL_MS = 2000;

type IncomingTrackTotals = {
  packetsReceived: IntegerValue;
  packetsLost: IntegerValue;
  bytesReceived: IntegerValue;
};

export type SubscriberInspectorStatistics = {
  id?: string;
  title?: string;
  audio: IncomingTrackTotals;
  video: IncomingTrackTotals & {
    resolution: OptionalValue<ResolutionValue>;
    codec: string | null;
    frameRate: OptionalValue<FrameRateValue>;
    decodedFrameRate: OptionalValue<FrameRateValue>;
    bitrateBps: OptionalValue<BitrateValue>;
    freezeCount: OptionalValue<IntegerValue>;
    totalFreezesDuration: OptionalValue<IntegerValue>;
  };
  packetLossRatio: OptionalValue<PacketLossValue>;
  connectionEstimatedBandwidthBps: OptionalValue<BitrateValue>;
  remotePublisherConnectionEstimatedBandwidthBps: OptionalValue<BitrateValue>;
};

export type useSubscriberStatsProps<TData = SubscriberInspectorStatistics> = {
  queryOptions?: QueryOptions<SubscriberInspectorStatistics | null, TData>;
  subscriber: Subscriber | null | undefined;
};

const useSubscriberStats = <Selected = SubscriberInspectorStatistics | null>({
  queryOptions,
  subscriber,
}: useSubscriberStatsProps<Selected>) => {
  return runtime$.useQuery({
    queryKey: ['archives', subscriber],
    refetchInterval: POLL_INTERVAL_MS,
    queryFn: async () => {
      if (!subscriber) {
        return null;
      }

      const stats = await readSubscriberStatsSafely(subscriber);

      if (!stats) {
        return null;
      }

      const audio = getSafeIncomingTrackTotals(stats.audio);
      const video = getSafeIncomingTrackTotals(stats.video);

      const packetLossRatio = calculatePacketLossRatio({
        packetsLost: video.packetsLost,
        packetsSuccessful: video.packetsReceived,
      });

      return {
        id: subscriber.id,
        title: subscriber.stream?.name ?? subscriber.id,
        audio: {
          packetsReceived: audio.packetsReceived,
          packetsLost: audio.packetsLost,
          bytesReceived: audio.bytesReceived,
        },
        video: {
          packetsReceived: video.packetsReceived,
          packetsLost: video.packetsLost,
          bytesReceived: video.bytesReceived,
          resolution: optionalValue(ResolutionValue, stats.video),
          codec: stats.video?.codec ?? null,
          frameRate: optionalValue(FrameRateValue, stats.video?.frameRate, { fallback: '-' }),
          decodedFrameRate: optionalValue(FrameRateValue, stats.video?.decodedFrameRate, {
            fallback: '-',
          }),
          bitrateBps: optionalValue(BitrateValue, stats.video?.bitrate, { fallback: '-' }),
          freezeCount: optionalValue(IntegerValue, stats.video?.freezeCount ?? null, {
            fallback: '-',
          }),
          totalFreezesDuration: optionalValue(
            IntegerValue,
            stats.video?.totalFreezesDuration ?? null,
            {
              fallback: '-',
            }
          ),
        },
        packetLossRatio: optionalValue(PacketLossValue, packetLossRatio, { fallback: '-' }),
        connectionEstimatedBandwidthBps: optionalValue(
          BitrateValue,
          stats.mediaLink?.transport?.connectionEstimatedBandwidth === undefined ||
            stats.mediaLink?.transport?.connectionEstimatedBandwidth < 0
            ? null
            : stats.mediaLink?.transport?.connectionEstimatedBandwidth,
          {
            fallback: '-',
          }
        ),
        remotePublisherConnectionEstimatedBandwidthBps: optionalValue(
          BitrateValue,
          stats.mediaLink?.remotePublisherTransport?.connectionEstimatedBandwidth === undefined ||
            stats.mediaLink?.remotePublisherTransport?.connectionEstimatedBandwidth < 0
            ? null
            : stats.mediaLink?.remotePublisherTransport?.connectionEstimatedBandwidth,
          {
            fallback: '-',
          }
        ),
      };
    },
    ...queryOptions,
  });
};

function readSubscriberStatsSafely(subscriber: Subscriber): Promise<SubscriberStats | null> {
  return new Promise((resolve) => {
    subscriber.getStats((error, stats) => {
      if (error || !stats) {
        resolve(null);
        return;
      }

      resolve(stats);
    });
  });
}

function getSafeIncomingTrackTotals(track?: {
  packetsReceived?: number;
  packetsLost?: number;
  bytesReceived?: number;
}): IncomingTrackTotals {
  return {
    packetsReceived: integerValue(track?.packetsReceived ?? 0),
    packetsLost: integerValue(track?.packetsLost ?? 0),
    bytesReceived: integerValue(track?.bytesReceived ?? 0),
  };
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

export default useSubscriberStats;

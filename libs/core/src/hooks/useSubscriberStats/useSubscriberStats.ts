import { runtime$ } from '@core/stores';
import type { QueryOptions } from '@core/types';
import {
  BitrateValue,
  ResolutionValue,
  FrameRateValue,
  IntegerValue,
  integerValue,
  OptionalValue,
  optionalValue,
  PacketLossValue,
} from '@core/metrics';
import type { Subscriber, SubscriberStats } from '@vonage/client-sdk-video';

const POLL_INTERVAL_MS = 2000;

export type IncomingTrackTotals = {
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

      const stats = await getSubscriberStats(subscriber);

      if (!stats) {
        return null;
      }

      const audio: IncomingTrackTotals = {
        packetsReceived: integerValue(stats.audio?.packetsReceived ?? 0),
        packetsLost: integerValue(stats.audio?.packetsLost ?? 0),
        bytesReceived: integerValue(stats.audio?.bytesReceived ?? 0),
      };

      const video: IncomingTrackTotals = {
        packetsReceived: integerValue(stats.video?.packetsReceived ?? 0),
        packetsLost: integerValue(stats.video?.packetsLost ?? 0),
        bytesReceived: integerValue(stats.video?.bytesReceived ?? 0),
      };

      const packetLossRatio = calculatePacketLossRatio({
        packetsLost: video.packetsLost,
        packetsSuccessful: video.packetsReceived,
      });

      const connectionEstimatedBandwidth = stats.mediaLink?.transport?.connectionEstimatedBandwidth;

      const remotePublisherConnectionEstimatedBandwidth =
        stats.mediaLink?.remotePublisherTransport?.connectionEstimatedBandwidth;

      return {
        id: subscriber.id,
        title: subscriber.stream?.name ?? subscriber.id,
        audio,
        video: {
          ...video,
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
          connectionEstimatedBandwidth === undefined || connectionEstimatedBandwidth < 0
            ? null
            : connectionEstimatedBandwidth,
          {
            fallback: '-',
          }
        ),
        remotePublisherConnectionEstimatedBandwidthBps: optionalValue(
          BitrateValue,
          remotePublisherConnectionEstimatedBandwidth === undefined ||
            remotePublisherConnectionEstimatedBandwidth < 0
            ? null
            : remotePublisherConnectionEstimatedBandwidth,
          {
            fallback: '-',
          }
        ),
      };
    },
    ...queryOptions,
  });
};

function getSubscriberStats(subscriber: Subscriber): Promise<SubscriberStats | null> {
  return new Promise((resolve) => {
    subscriber.getStats((error, stats) => {
      if (error) return resolve(null);
      resolve(stats ?? null);
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

export default useSubscriberStats;

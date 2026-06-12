import { integerValue, IntegerValue } from '@core/metrics';
import type { Subscriber, SubscriberStats } from '@vonage/client-sdk-video';
import { IncomingTrackTotals } from './useSubscriberStats';

export function readSubscriberStatsSafely(subscriber: Subscriber): Promise<SubscriberStats | null> {
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

export function getSafeIncomingTrackTotals(track?: {
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

export function calculatePacketLossRatio({
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

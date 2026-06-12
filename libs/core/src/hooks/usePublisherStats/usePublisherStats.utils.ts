import { integerValue, IntegerValue } from '@core/metrics';
import type { Publisher, PublisherStats, PublisherStatsArr } from '@vonage/client-sdk-video';
import { OutgoingTrackTotals } from './usePublisherStats';

export function calculateBitrateFromDelta({
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

export function readPublisherFrameRate(stats?: PublisherStats): number | null {
  const frameRate = stats?.video?.frameRate;

  if (frameRate === null || frameRate === undefined) {
    return null;
  }

  return frameRate;
}

export function readPublisherResolution(
  publisher: Publisher
): { width: number; height: number } | null {
  const width = publisher.videoWidth();
  const height = publisher.videoHeight();

  if (width == null || height == null) {
    return null;
  }

  return { width, height };
}

export function aggregateOutgoingTrackTotals(
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

export function getSafeOutgoingTrackTotals(track?: {
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

export function readPublisherStatsSafely(publisher: Publisher): Promise<PublisherStatsArr | null> {
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

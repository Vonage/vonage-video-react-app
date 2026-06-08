import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type {
  Publisher,
  PublisherStats,
  PublisherStatsArr,
  Subscriber,
  SubscriberStats,
  VideoLayerStats,
} from '@vonage/client-sdk-video';
import type { SubscriberWrapper } from '@app-types/session';

const POLL_INTERVAL_MS = 1000;

type OutgoingTrackTotals = {
  packetsSent: number;
  packetsLost: number;
  bytesSent: number;
};

type IncomingTrackTotals = {
  packetsReceived: number;
  packetsLost: number;
  bytesReceived: number;
};

export type PublisherInspectorStatistics = {
  resolution: { width: number; height: number } | null;
  frameRate: number | null;
  bitrateBps: number | null;
  packetLossRatio: number | null;
  audio: OutgoingTrackTotals | null;
  video: OutgoingTrackTotals | null;
  connectionEstimatedBandwidthBps: number | null;
  videoLayers: VideoLayerStats[] | null;
};

export type SubscriberInspectorStatistics = {
  id: string;
  title: string;
  audio: IncomingTrackTotals;
  video: IncomingTrackTotals & {
    width: number | null;
    height: number | null;
    codec: string | null;
    frameRate: number | null;
    decodedFrameRate: number | null;
    bitrateBps: number | null;
    freezeCount: number | null;
    totalFreezesDuration: number | null;
  };
  packetLossRatio: number | null;
  connectionEstimatedBandwidthBps: number | null;
  remotePublisherConnectionEstimatedBandwidthBps: number | null;
};

export type StatisticsInspectorData = {
  publisher: PublisherInspectorStatistics | null;
  subscribers: SubscriberInspectorStatistics[];
};

const EMPTY_DATA: StatisticsInspectorData = {
  publisher: null,
  subscribers: [],
};

type UseStatisticsInspectorDataArgs = {
  meetingPublisher: Publisher | null | undefined;
  previewPublisher: Publisher | null | undefined;
  subscriberWrappers: SubscriberWrapper[];
  publisherStatisticsEnabled: boolean;
};

const useStatisticsInspectorData = ({
  meetingPublisher,
  previewPublisher,
  subscriberWrappers,
  publisherStatisticsEnabled,
}: UseStatisticsInspectorDataArgs): StatisticsInspectorData => {
  const [data, setData] = useState<StatisticsInspectorData>(EMPTY_DATA);
  const previousPublisherVideoSampleRef = useRef<{ bytesSent: number; timestamp: number } | null>(
    null
  );

  useEffect(() => {
    const publisher = meetingPublisher ?? previewPublisher ?? null;
    let isCancelled = false;

    const poll = async () => {
      const [publisherStatistics, subscriberStatistics] = await Promise.all([
        readPublisherInspectorStatistics({
          publisher,
          publisherStatisticsEnabled,
          previousPublisherVideoSampleRef,
        }),
        readSubscriberInspectorStatistics(subscriberWrappers),
      ]);

      if (isCancelled) {
        return;
      }

      setData((previousData) => {
        const shouldKeepCurrentEmptyState =
          previousData.publisher === null &&
          previousData.subscribers.length === 0 &&
          publisherStatistics === null &&
          subscriberStatistics.length === 0;

        if (shouldKeepCurrentEmptyState) {
          return previousData;
        }

        return {
          publisher: publisherStatistics,
          subscribers: subscriberStatistics,
        };
      });
    };

    void poll();
    const intervalIdentifier = setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(intervalIdentifier);
    };
  }, [meetingPublisher, previewPublisher, publisherStatisticsEnabled, subscriberWrappers]);

  return data;
};

async function readPublisherInspectorStatistics({
  publisher,
  publisherStatisticsEnabled,
  previousPublisherVideoSampleRef,
}: {
  publisher: Publisher | null;
  publisherStatisticsEnabled: boolean;
  previousPublisherVideoSampleRef: RefObject<{
    bytesSent: number;
    timestamp: number;
  } | null>;
}): Promise<PublisherInspectorStatistics | null> {
  if (!publisher || !publisherStatisticsEnabled) {
    previousPublisherVideoSampleRef.current = null;
    return null;
  }

  const publisherStatsContainers = await readPublisherStatsSafely(publisher);

  if (!publisherStatsContainers || publisherStatsContainers.length === 0) {
    previousPublisherVideoSampleRef.current = null;
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

    return normalizeNonNegative(Math.max(...connectionEstimatedBandwidthValues));
  })();
  const packetLossRatio = calculatePacketLossRatio({
    packetsLost: videoTotals.packetsLost,
    packetsSuccessful: videoTotals.packetsSent,
  });

  const currentTimestamp = Date.now();
  const bitrateBps = calculateBitrateFromDelta({
    currentBytesSent: videoTotals.bytesSent,
    currentTimestamp,
    previousSample: previousPublisherVideoSampleRef.current,
  });

  previousPublisherVideoSampleRef.current = {
    bytesSent: videoTotals.bytesSent,
    timestamp: currentTimestamp,
  };

  return {
    resolution,
    frameRate,
    bitrateBps,
    packetLossRatio,
    audio: audioTotals,
    video: videoTotals,
    connectionEstimatedBandwidthBps,
    videoLayers: firstPublisherStatsContainer?.stats.video?.layers ?? null,
  };
}

async function readSubscriberInspectorStatistics(
  subscriberWrappers: SubscriberWrapper[]
): Promise<SubscriberInspectorStatistics[]> {
  const subscriberStatisticsPromises = subscriberWrappers.map(async (subscriberWrapper) => {
    const subscriber = subscriberWrapper.subscriber;

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
      id: subscriberWrapper.id,
      title: subscriber.stream?.name ?? subscriberWrapper.id,
      audio: {
        packetsReceived: audio.packetsReceived,
        packetsLost: audio.packetsLost,
        bytesReceived: audio.bytesReceived,
      },
      video: {
        packetsReceived: video.packetsReceived,
        packetsLost: video.packetsLost,
        bytesReceived: video.bytesReceived,
        width: stats.video?.width ?? null,
        height: stats.video?.height ?? null,
        codec: stats.video?.codec ?? null,
        frameRate: stats.video?.frameRate ?? null,
        decodedFrameRate: stats.video?.decodedFrameRate ?? null,
        bitrateBps: stats.video?.bitrate ?? null,
        freezeCount: stats.video?.freezeCount ?? null,
        totalFreezesDuration: stats.video?.totalFreezesDuration ?? null,
      },
      packetLossRatio,
      connectionEstimatedBandwidthBps: normalizeNonNegative(
        stats.mediaLink?.transport?.connectionEstimatedBandwidth
      ),
      remotePublisherConnectionEstimatedBandwidthBps: normalizeNonNegative(
        stats.mediaLink?.remotePublisherTransport?.connectionEstimatedBandwidth
      ),
    };
  });

  const subscriberStatistics = await Promise.all(subscriberStatisticsPromises);

  return subscriberStatistics.filter(isNonNullable);
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
        packetsSent: accumulator.packetsSent + track.packetsSent,
        packetsLost: accumulator.packetsLost + track.packetsLost,
        bytesSent: accumulator.bytesSent + track.bytesSent,
      };
    },
    { packetsSent: 0, packetsLost: 0, bytesSent: 0 }
  );
}

function getSafeOutgoingTrackTotals(track?: {
  packetsSent?: number;
  packetsLost?: number;
  bytesSent?: number;
}): OutgoingTrackTotals {
  return {
    packetsSent: track?.packetsSent ?? 0,
    packetsLost: track?.packetsLost ?? 0,
    bytesSent: track?.bytesSent ?? 0,
  };
}

function getSafeIncomingTrackTotals(track?: {
  packetsReceived?: number;
  packetsLost?: number;
  bytesReceived?: number;
}): IncomingTrackTotals {
  return {
    packetsReceived: track?.packetsReceived ?? 0,
    packetsLost: track?.packetsLost ?? 0,
    bytesReceived: track?.bytesReceived ?? 0,
  };
}

function isNonNullable<T>(value: T | null): value is T {
  return value !== null;
}

function normalizeNonNegative(value: number | undefined): number | null {
  if (value === undefined || value < 0) {
    return null;
  }

  return value;
}

function readPublisherFrameRate(stats?: PublisherStats): number | null {
  const frameRate = stats?.video?.frameRate;

  if (typeof frameRate !== 'number') {
    return null;
  }

  return frameRate;
}

function readPublisherResolution(publisher: Publisher): { width: number; height: number } | null {
  const width = publisher.videoWidth();
  const height = publisher.videoHeight();

  if (!width || !height) {
    return null;
  }

  return { width, height };
}

function calculatePacketLossRatio({
  packetsLost,
  packetsSuccessful,
}: {
  packetsLost: number;
  packetsSuccessful: number;
}): number | null {
  const totalPackets = packetsLost + packetsSuccessful;

  if (totalPackets <= 0) {
    return null;
  }

  return packetsLost / totalPackets;
}

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

export default useStatisticsInspectorData;

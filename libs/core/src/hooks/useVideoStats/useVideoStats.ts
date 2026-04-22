import { useEffect, useRef, useState } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';
import readPublisherStats from './helpers/readPublisherStats';
import type { VideoStats } from './types';

const POLL_INTERVAL_MS = 1000;

const NULL_STATS: VideoStats = { width: null, height: null, frameRate: null };

const useVideoStats = (publisher: Publisher | null): VideoStats => {
  const [stats, setStats] = useState<VideoStats>(NULL_STATS);
  const lastPublisherRef = useRef<Publisher | null>(null);

  useEffect(() => {
    if (!publisher) return;

    const pollStats = () => {
      const next = readPublisherStats(publisher);
      setStats((prev) => {
        const unchanged =
          prev.width === next.width &&
          prev.height === next.height &&
          prev.frameRate === next.frameRate;
        return unchanged ? prev : next;
      });
    };

    pollStats();
    const intervalId = setInterval(pollStats, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [publisher]);

  if (!publisher) {
    lastPublisherRef.current = null;
    return NULL_STATS;
  }

  if (lastPublisherRef.current !== publisher) {
    lastPublisherRef.current = publisher;
    return readPublisherStats(publisher);
  }

  return stats;
};

export default useVideoStats;

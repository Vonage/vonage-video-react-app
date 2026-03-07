import { useState, useEffect, useRef } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';
import readPublisherStats from './helpers/readPublisherStats';
import type { VideoStats } from './types';

const POLL_INTERVAL_MS = 1000;

const NULL_STATS: VideoStats = { width: null, height: null, frameRate: null };

/**
 * Polls a Vonage publisher for the current video resolution and frame rate.
 *
 * When the `publisher` reference changes, fresh stats are derived directly
 * during render (via a ref comparison) so the UI never shows stale values
 * while waiting for the next poll tick. The polling effect then takes over
 * and updates state every second via a `setInterval` callback.
 *
 * @param {Publisher | null} publisher - The Vonage publisher instance to monitor.
 * @returns {VideoStats} The current video stats (width, height, frameRate).
 */
const useVideoStats = (publisher: Publisher | null): VideoStats => {
  const [stats, setStats] = useState<VideoStats>(NULL_STATS);
  // Tracks which publisher the current `stats` state was last read from.
  // Used to detect publisher changes during render without calling setState.
  const lastPublisherRef = useRef<Publisher | null>(null);

  useEffect(() => {
    if (!publisher) return;

    function pollStats() {
      const next = readPublisherStats(publisher!);
      setStats((prev) => {
        const unchanged =
          prev.width === next.width &&
          prev.height === next.height &&
          prev.frameRate === next.frameRate;
        return unchanged ? prev : next;
      });
    }

    // Populate stats immediately when publisher is (re)assigned so that
    // `stats` state is fresh before the first interval tick fires.
    pollStats();
    const intervalId = setInterval(pollStats, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [publisher]);

  if (!publisher) {
    lastPublisherRef.current = null;
    return NULL_STATS;
  }

  // On the render where publisher changes (before the effect has run and
  // called pollStats), return fresh stats directly to avoid showing stale
  // values from the previous publisher.
  if (lastPublisherRef.current !== publisher) {
    lastPublisherRef.current = publisher;
    return readPublisherStats(publisher);
  }

  return stats;
};

export default useVideoStats;

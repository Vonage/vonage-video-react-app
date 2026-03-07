import { useState, useEffect, useLayoutEffect } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';
import readPublisherStats from './helpers/readPublisherStats';
import type { VideoStats } from './types';

const POLL_INTERVAL_MS = 1000;

const NULL_STATS: VideoStats = { width: null, height: null, frameRate: null };

/**
 * Polls a Vonage publisher for the current video resolution and frame rate.
 *
 * Stats are synchronised immediately whenever the `publisher` reference changes
 * (via `useLayoutEffect`, which fires before the browser paints) so the UI
 * never shows stale values while waiting for the first poll tick.
 *
 * @param {Publisher | null} publisher - The Vonage publisher instance to monitor.
 * @returns {VideoStats} The current video stats (width, height, frameRate).
 */
const useVideoStats = (publisher: Publisher | null): VideoStats => {
  const [stats, setStats] = useState<VideoStats>(NULL_STATS);

  // Synchronise stats before the browser paints whenever the publisher instance
  // changes (including on initial mount). useLayoutEffect fires synchronously
  // after DOM mutations but before the browser has a chance to paint, so the
  // user never sees a frame with stale or empty stats.
  useLayoutEffect(() => {
    setStats(publisher ? readPublisherStats(publisher) : NULL_STATS);
  }, [publisher]);

  useEffect(() => {
    if (!publisher) return;

    const intervalId = setInterval(() => {
      const next = readPublisherStats(publisher);
      setStats((prev) => {
        const hasChanged =
          prev.width !== next.width ||
          prev.height !== next.height ||
          prev.frameRate !== next.frameRate;
        return hasChanged ? next : prev;
      });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [publisher]);

  if (!publisher) return NULL_STATS;

  return stats;
};

export default useVideoStats;

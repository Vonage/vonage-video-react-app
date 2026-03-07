import { useState, useEffect } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';

const POLL_INTERVAL_MS = 1000;

export type VideoStats = {
  width: number | null;
  height: number | null;
  frameRate: number | null;
};

/**
 * Formats a video height into a standard resolution label.
 * @param {number | null} height - The video height in pixels.
 * @returns {string | null} The formatted resolution label (e.g. "720p"), or null if height is not available.
 */
export const formatResolution = (height: number | null): string | null => {
  if (height === null) return null;
  return `${height}p`;
};

/**
 * Formats a frame rate value into a display string.
 * @param {number | null} frameRate - The frame rate in frames per second.
 * @returns {string | null} The formatted frame rate (e.g. "30fps"), or null if frameRate is not available.
 */
export const formatFrameRate = (frameRate: number | null): string | null => {
  if (frameRate === null) return null;
  return `${Math.round(frameRate)}fps`;
};

const NULL_STATS: VideoStats = { width: null, height: null, frameRate: null };

/**
 * Reads the current video stats from a Vonage publisher instance.
 *
 * Resolution is read directly from the SDK's `videoWidth()` / `videoHeight()` methods,
 * which reflect the actual captured dimensions of the camera stream.
 *
 * Frame rate cannot be obtained via the session stats API (`session.getPublisherStats()`)
 * because the preview publisher is not connected to a session. Instead, we reach the
 * underlying `MediaStreamTrack` via `publisher.getVideoSource().track` and call the
 * standard Web API `track.getSettings().frameRate`.
 *
 * @param {Publisher} publisher - An initialized Vonage publisher instance.
 * @returns {VideoStats} The current width, height, and frame rate (each `null` if unavailable).
 */
function readPublisherStats(publisher: Publisher): VideoStats {
  // videoWidth() / videoHeight() return `undefined` before the camera stream is ready;
  // we normalize to `null` to keep VideoStats consistently typed.
  const width = publisher.videoWidth() ?? null;
  const height = publisher.videoHeight() ?? null;

  let frameRate: number | null = null;
  try {
    // getVideoSource() returns a Vonage VideoSource whose `.track` is the raw
    // MediaStreamTrack. We read frameRate from the track's settings because
    // the preview publisher is not published to a session, making the
    // session.getPublisherStats() API unavailable here.
    const source = publisher.getVideoSource();
    const track = source?.track;
    if (track) {
      frameRate = track.getSettings().frameRate ?? null;
    }
  } catch {
    // getVideoSource may throw if publisher is not fully initialized
  }

  return { width, height, frameRate };
}

/**
 * useVideoStats Hook
 *
 * Polls the publisher for current video resolution and frame rate.
 * Resolution is obtained from the publisher's videoWidth/videoHeight methods.
 * Frame rate is obtained from the underlying MediaStreamTrack settings,
 * since the preview publisher is not connected to a session.
 * @param {Publisher | null} publisher - The Vonage publisher instance to monitor.
 * @returns {VideoStats} The current video stats (width, height, frameRate).
 */
const useVideoStats = (publisher: Publisher | null): VideoStats => {
  const [stats, setStats] = useState<VideoStats>(() =>
    publisher ? readPublisherStats(publisher) : NULL_STATS
  );
  const [trackedPublisher, setTrackedPublisher] = useState(publisher);

  // When the publisher instance changes, update stats during render rather than
  // inside an effect to avoid a synchronous setState-in-effect lint violation.
  // React immediately re-renders with the updated state when setState is called
  // during render (derived state pattern).
  if (trackedPublisher !== publisher) {
    setTrackedPublisher(publisher);

    const nextStats = publisher ? readPublisherStats(publisher) : NULL_STATS;
    const hasChanged =
      stats.width !== nextStats.width ||
      stats.height !== nextStats.height ||
      stats.frameRate !== nextStats.frameRate;

    if (hasChanged) {
      setStats(nextStats);
    }
  }

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

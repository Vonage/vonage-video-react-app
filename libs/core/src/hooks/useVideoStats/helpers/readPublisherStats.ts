import type { Publisher } from '@vonage/client-sdk-video';
import type { VideoStats } from '../types';

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

export default readPublisherStats;

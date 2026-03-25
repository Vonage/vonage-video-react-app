import { useEffect, useRef } from 'react';
import { Subscriber } from '@vonage/client-sdk-video';
import { Box } from 'opentok-layout-js';
import hasWebAudioSupport from '@utils/hasWebAudioSupport';

/**
 * Calculates a stereo pan value from -1 (full left) to +1 (full right)
 * based on the horizontal center of the tile relative to the container width.
 */
function calculatePan(box: Box, containerWidth: number): number {
  if (containerWidth <= 0) return 0;
  const tileCenterX = box.left + box.width / 2;
  return (tileCenterX / containerWidth) * 2 - 1;
}

/**
 * useSpatialAudio hook
 *
 * Routes a subscriber's audio through a Web Audio StereoPannerNode so that the
 * audio is panned left or right based on the tile's horizontal position on screen.
 *
 * When active:
 * - Captures the subscriber's MediaStream via the `mediaStreamAvailable` event.
 * - Mutes the subscriber's default audio output (setAudioVolume(0)).
 * - Routes audio through: MediaStreamAudioSourceNode → StereoPannerNode → AudioContext.destination.
 * - Updates the pan value whenever the tile's box or containerWidth change.
 *
 * When inactive (feature disabled or not in grid mode):
 * - Disconnects all Web Audio nodes.
 * - Restores the subscriber's default audio (setAudioVolume(100)).
 *
 * @param subscriber - The Vonage Subscriber instance.
 * @param box - The tile's layout box (position and dimensions).
 * @param containerWidth - The width of the video tile container in pixels.
 * @param isEnabled - Whether spatial audio is currently enabled by the user.
 */
const useSpatialAudio = (
  subscriber: Subscriber | null | undefined,
  box: Box | undefined,
  containerWidth: number,
  isEnabled: boolean
): void => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isSpatialActiveRef = useRef(false);
  const panDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Capture the subscriber's MediaStream as soon as it becomes available.
  useEffect(() => {
    if (!subscriber) return;

    const handleMediaStreamAvailable = ({ mediaStream }: { mediaStream: MediaStream }) => {
      mediaStreamRef.current = mediaStream;
    };

    subscriber.on('mediaStreamAvailable', handleMediaStreamAvailable);

    return () => {
      subscriber.off('mediaStreamAvailable', handleMediaStreamAvailable);
    };
  }, [subscriber]);

  // Connect or disconnect the Web Audio pipeline based on enabled/layout state.
  useEffect(() => {
    const shouldBeActive = isEnabled && hasWebAudioSupport();

    if (shouldBeActive && !isSpatialActiveRef.current) {
      // --- Activate spatial audio ---
      const mediaStream = mediaStreamRef.current;
      if (!subscriber || !mediaStream || !box || containerWidth <= 0) return;

      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length === 0) return;

      try {
        const audioCtx = new AudioContext();
        const audioOnlyStream = new MediaStream(audioTracks);
        const sourceNode = audioCtx.createMediaStreamSource(audioOnlyStream);
        const pannerNode = audioCtx.createStereoPanner();

        pannerNode.pan.value = calculatePan(box, containerWidth);
        sourceNode.connect(pannerNode);
        pannerNode.connect(audioCtx.destination);

        audioContextRef.current = audioCtx;
        sourceNodeRef.current = sourceNode;
        pannerNodeRef.current = pannerNode;

        // Silence the subscriber's built-in audio output to prevent double playback.
        subscriber.setAudioVolume(0);
        isSpatialActiveRef.current = true;
      } catch {
        // AudioContext creation can fail (e.g. in test environments) — fail silently.
      }
    } else if (!shouldBeActive && isSpatialActiveRef.current) {
      // --- Deactivate spatial audio ---
      try {
        sourceNodeRef.current?.disconnect();
        pannerNodeRef.current?.disconnect();
        void audioContextRef.current?.close();
      } catch {
        // Ignore errors during cleanup.
      }

      sourceNodeRef.current = null;
      pannerNodeRef.current = null;
      audioContextRef.current = null;
      isSpatialActiveRef.current = false;

      // Restore the subscriber's default audio output.
      subscriber?.setAudioVolume(100);
    }
  }, [isEnabled, subscriber, box, containerWidth]);

  // Update the pan value whenever the tile position or container width changes.
  // Debounced to 150ms so rapid resize events don't thrash the audio graph.
  useEffect(() => {
    if (!isSpatialActiveRef.current || !pannerNodeRef.current || !box || containerWidth <= 0) {
      return;
    }

    if (panDebounceRef.current !== null) {
      clearTimeout(panDebounceRef.current);
    }

    panDebounceRef.current = setTimeout(() => {
      panDebounceRef.current = null;
      if (!pannerNodeRef.current || !box || containerWidth <= 0) return;
      const pan = calculatePan(box, containerWidth);
      pannerNodeRef.current.pan.setValueAtTime(pan, audioContextRef.current?.currentTime ?? 0);
    }, 150);
  }, [box, containerWidth]);

  // Full cleanup on unmount.
  useEffect(() => {
    return () => {
      if (panDebounceRef.current !== null) {
        clearTimeout(panDebounceRef.current);
      }
      if (isSpatialActiveRef.current) {
        try {
          sourceNodeRef.current?.disconnect();
          pannerNodeRef.current?.disconnect();
          void audioContextRef.current?.close();
        } catch {
          // Ignore errors during cleanup.
        }
        subscriber?.setAudioVolume(100);
      }
    };
    // subscriber intentionally omitted — we only want this to run on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useSpatialAudio;

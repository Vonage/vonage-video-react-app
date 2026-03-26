import { useEffect, useId, useRef } from 'react';
import { Subscriber } from '@vonage/client-sdk-video';
import { Box } from 'opentok-layout-js';
import hasWebAudioSupport from '@utils/hasWebAudioSupport';
import {
  acquireSharedAudioContext,
  releaseSharedAudioContext,
  updateSharedAudioContextSinkId,
} from '@utils/sharedAudioContext';
import {
  registerPanner,
  unregisterPanner,
  updatePannerLayout,
} from '@utils/spatialAudioPanManager';

/**
 * Calculates a stereo pan value from -1 (full left) to +1 (full right)
 * based on the horizontal center of the tile relative to the container width.
 * The result is clamped to [-1, 1] to stay within the valid StereoPannerNode range.
 */
export function calculatePan(box: Box, containerWidth: number): number {
  if (containerWidth <= 0) return 0;
  const tileCenterX = box.left + box.width / 2;
  const rawPan = (tileCenterX / containerWidth) * 2 - 1;
  return Math.max(-1, Math.min(1, rawPan));
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
 * When inactive (feature disabled):
 * - Disconnects all Web Audio nodes.
 * - Restores the subscriber's pre-mute audio volume.
 *
 * @param params - Spatial audio configuration.
 * @param params.subscriber - The Vonage Subscriber instance.
 * @param params.box - The tile's layout box (position and dimensions).
 * @param params.containerWidth - The width of the video tile container in pixels.
 * @param params.isEnabled - Whether spatial audio is currently enabled by the user.
 */
type UseSpatialAudioParams = {
  subscriber: Subscriber | null | undefined;
  box: Box | undefined;
  containerWidth: number;
  isEnabled: boolean;
  audioOutputDeviceId?: string;
};

const useSpatialAudio = ({
  subscriber,
  box,
  containerWidth,
  isEnabled,
  audioOutputDeviceId,
}: UseSpatialAudioParams): void => {
  const pannerId = useId();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isSpatialActiveRef = useRef(false);
  // Track the latest subscriber in a ref so cleanup always operates on the correct instance.
  const subscriberRef = useRef<Subscriber | null | undefined>(subscriber);
  // Track the pre-mute volume so we can restore it exactly on deactivation.
  const preMuteVolumeRef = useRef<number>(100);

  // Keep subscriberRef in sync with the latest subscriber prop.
  useEffect(() => {
    subscriberRef.current = subscriber;
  }, [subscriber]);

  // Activates the Web Audio pipeline for a given subscriber and stream.
  const activate = (
    sub: Subscriber,
    mediaStream: MediaStream,
    currentBox: Box | undefined,
    currentContainerWidth: number
  ) => {
    if (!currentBox || currentContainerWidth <= 0) return;

    const audioTracks = mediaStream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const audioContext = acquireSharedAudioContext();
      const audioOnlyStream = new MediaStream(audioTracks);
      const sourceNode = audioContext.createMediaStreamSource(audioOnlyStream);
      const pannerNode = audioContext.createStereoPanner();

      pannerNode.pan.value = calculatePan(currentBox, currentContainerWidth);
      sourceNode.connect(pannerNode);
      pannerNode.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      sourceNodeRef.current = sourceNode;
      pannerNodeRef.current = pannerNode;

      registerPanner(pannerId, pannerNode, audioContext, currentBox, currentContainerWidth);

      // Capture current volume before muting so we can restore it on deactivation.
      preMuteVolumeRef.current = sub.getAudioVolume();
      sub.setAudioVolume(0);
      isSpatialActiveRef.current = true;
    } catch {
      // AudioContext creation can fail (e.g. in test environments) — fail silently.
    }
  };

  // Capture the subscriber's MediaStream as soon as it becomes available.
  // If spatial audio is already enabled when the stream arrives, activate immediately.
  useEffect(() => {
    if (!subscriber) return;

    const handleMediaStreamAvailable = ({ mediaStream }: { mediaStream: MediaStream }) => {
      mediaStreamRef.current = mediaStream;

      // Retry activation if the user had already toggled spatial audio on
      // before the stream was ready (race condition fix).
      if (isEnabled && !isSpatialActiveRef.current) {
        activate(subscriber, mediaStream, box, containerWidth);
      }
    };

    subscriber.on('mediaStreamAvailable', handleMediaStreamAvailable);

    return () => {
      subscriber.off('mediaStreamAvailable', handleMediaStreamAvailable);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriber]);

  // Deactivates the Web Audio pipeline and restores the subscriber's original volume.
  const deactivate = (sub: Subscriber | null | undefined) => {
    unregisterPanner(pannerId);

    try {
      sourceNodeRef.current?.disconnect();
      pannerNodeRef.current?.disconnect();
      if (audioContextRef.current) {
        releaseSharedAudioContext();
      }
    } catch {
      // Ignore errors during cleanup.
    }

    sourceNodeRef.current = null;
    pannerNodeRef.current = null;
    audioContextRef.current = null;
    isSpatialActiveRef.current = false;

    sub?.setAudioVolume(preMuteVolumeRef.current);
  };

  // Connect or disconnect the Web Audio pipeline based on enabled state.
  useEffect(() => {
    const shouldBeActive = isEnabled && hasWebAudioSupport();

    if (shouldBeActive && !isSpatialActiveRef.current) {
      const mediaStream = mediaStreamRef.current;
      if (!subscriber || !mediaStream) return;
      activate(subscriber, mediaStream, box, containerWidth);
    } else if (!shouldBeActive && isSpatialActiveRef.current) {
      deactivate(subscriber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, subscriber, box, containerWidth]);

  // Update the pan value whenever the tile position or container width changes.
  // The centralized pan manager batches all updates into a single rAF callback.
  useEffect(() => {
    if (!isSpatialActiveRef.current || !box || containerWidth <= 0) return;
    updatePannerLayout(pannerId, box, containerWidth);
  }, [pannerId, box, containerWidth]);

  // Sync the shared AudioContext output device when the user switches speakers.
  // Uses AudioContext.setSinkId() (Chrome 110+, Edge 110+). No-op on unsupported browsers.
  useEffect(() => {
    if (!isSpatialActiveRef.current || !audioOutputDeviceId) return;
    updateSharedAudioContextSinkId(audioOutputDeviceId);
  }, [audioOutputDeviceId]);

  // Full cleanup on unmount — uses subscriberRef to always get the latest instance.
  useEffect(() => {
    return () => {
      if (isSpatialActiveRef.current) {
        deactivate(subscriberRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useSpatialAudio;

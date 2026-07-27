import type { Publisher } from '@vonage/client-sdk-video';
import mediaDevices$ from '@core/stores/mediaDevices';
import { useMountEffect } from '@web/hooks';
import attempt from '@common/execution/attempt';
import type { UnsubscribeCallback } from 'react-global-state-hooks';

/**
 * Syncs publisher video/audio sources with the selected devices from the store.
 * Handles device changes (user selection) and disconnections (hardware unplugged).
 *
 * This is temporal until we refactor the publishers and we implement a more robust solution syncing with the publisher.
 */
const useSyncPublisherDevices = (
  publisherRef: React.RefObject<Publisher | null>,
  args: {
    setIsAudioEnabled?: (enabled: boolean) => void;
    setIsVideoEnabled?: (enabled: boolean) => void;
  }
): void => {
  // Sync video source
  useMountEffect(() => {
    const subscribers = [
      args.setIsVideoEnabled
        ? mediaDevices$.subscribe(
            ({ videoinput }) => videoinput,
            async (input) => {
              const didChanged = publisherRef.current?.getVideoSource()?.deviceId !== input;
              if (didChanged) void attempt(() => publisherRef.current?.setVideoSource(input!));

              const { isStoreReady } = mediaDevices$.getMetadata();
              if (isStoreReady.status === 'pending') {
                await isStoreReady;
              }

              if (hasDevices('videoinput')) return;
              // Stop publishing on the SDK, not just the UI state — otherwise the
              // publisher keeps transmitting and a reconnected camera resumes video
              // while the toolbar shows it as off.
              attempt(() => publisherRef.current?.publishVideo(false));
              args.setIsVideoEnabled?.(false);
            },
            {
              skipFirst: true,
            }
          )
        : undefined,

      args?.setIsAudioEnabled
        ? mediaDevices$.subscribe(
            ({ audioinput }) => audioinput,
            async (input) => {
              const didChanged = publisherRef.current?.getAudioSource()?.id !== input;
              if (didChanged) void attempt(() => publisherRef.current?.setAudioSource(input!));

              const { isStoreReady } = mediaDevices$.getMetadata();
              if (isStoreReady.status === 'pending') {
                await isStoreReady;
              }

              if (hasDevices('audioinput')) return;
              // Stop publishing on the SDK, not just the UI state — otherwise the
              // publisher keeps transmitting and a reconnected mic resumes audio
              // while the toolbar shows it as muted.
              attempt(() => publisherRef.current?.publishAudio(false));
              args.setIsAudioEnabled?.(false);
            },
            {
              skipFirst: true,
            }
          )
        : undefined,
    ].filter(Boolean) as UnsubscribeCallback[];

    return () => {
      subscribers.forEach((unsubscribe) => unsubscribe());
    };
  });
};

function hasDevices(kind: MediaDeviceKind): boolean {
  return Object.keys(mediaDevices$.mediaDevicesMap$.getState()[kind]).length > 0;
}

export default useSyncPublisherDevices;

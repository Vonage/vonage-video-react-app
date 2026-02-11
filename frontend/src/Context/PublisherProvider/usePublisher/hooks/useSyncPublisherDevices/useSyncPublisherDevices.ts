import type { Publisher } from '@vonage/client-sdk-video';
import mediaDevices$ from '@core/stores/devices/devices$';
import { useMountEffect } from '@common/hooks';
import attempt from 'lodash/attempt';
import type { UnsubscribeCallback } from 'react-global-state-hooks';

/**
 * Syncs publisher video/audio sources with the selected devices from the store.
 * Handles device changes (user selection) and disconnections (hardware unplugged).
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
            (input) => {
              const didChanged = publisherRef.current?.getVideoSource()?.deviceId !== input;
              if (didChanged) attempt(() => publisherRef.current?.setVideoSource(input!));

              if (hasDevices('videoinput')) return;
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
            (input) => {
              const didChanged = publisherRef.current?.getAudioSource()?.id !== input;
              if (didChanged) attempt(() => publisherRef.current?.setAudioSource(input!));

              if (hasDevices('audioinput')) return;
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

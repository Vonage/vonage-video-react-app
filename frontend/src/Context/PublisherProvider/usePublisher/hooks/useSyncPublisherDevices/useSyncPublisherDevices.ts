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
    // Track previous values to detect disconnection (transition from value to undefined)
    let prevVideoInput = mediaDevices$.getState().videoinput;
    let prevAudioInput = mediaDevices$.getState().audioinput;

    const subscribers = [
      args.setIsVideoEnabled
        ? mediaDevices$.subscribe(
            ({ videoinput }) => videoinput,
            (input) => {
              attempt(() => publisherRef.current?.setVideoSource(input!));

              // Only disable if device was disconnected (had value before, now undefined)
              if (!input && prevVideoInput) {
                args.setIsVideoEnabled?.(false);
              }
              prevVideoInput = input;
            }
          )
        : undefined,

      args?.setIsAudioEnabled
        ? mediaDevices$.subscribe(
            ({ audioinput }) => audioinput,
            (input) => {
              attempt(() => publisherRef.current?.setAudioSource(input!));

              // Only disable if device was disconnected (had value before, now undefined)
              if (!input && prevAudioInput) {
                args.setIsAudioEnabled?.(false);
              }
              prevAudioInput = input;
            }
          )
        : undefined,
    ].filter(Boolean) as UnsubscribeCallback[];

    return () => {
      subscribers.forEach((unsubscribe) => unsubscribe());
    };
  });
};
export default useSyncPublisherDevices;

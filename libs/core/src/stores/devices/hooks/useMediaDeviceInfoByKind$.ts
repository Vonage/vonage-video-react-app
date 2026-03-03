import mediaDevicesMap$ from '../observables/mediaDevicesMap$';
import type { MediaDeviceInfoJSON } from '@web/types';

type MediaDevicesMap = Record<MediaDeviceKind, Record<string, MediaDeviceInfoJSON>>;

/**
 * Base hook, gives access to the media devices organized by kind and deviceId
 */
const useMediaDeviceInfoByKind$ = mediaDevicesMap$.createSelectorHook(
  (mediaDeviceInfoByKind: MediaDevicesMap) => mediaDeviceInfoByKind
);

export default useMediaDeviceInfoByKind$;

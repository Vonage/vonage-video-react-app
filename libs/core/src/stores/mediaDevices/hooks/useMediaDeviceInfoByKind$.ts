import mediaDevicesMap$ from '../observables/mediaDevicesMap$';

/**
 * Base hook, gives access to the media devices organized by kind and deviceId
 */
const useMediaDeviceInfoByKind$ = mediaDevicesMap$.createSelectorHook(
  (mediaDeviceInfoByKind) => mediaDeviceInfoByKind
);

export default useMediaDeviceInfoByKind$;

import mediaDeviceInfoByKind$ from '../observables/mediaDeviceInfoByKind$';

/**
 * Base hook, gives access to the media devices organized by kind and deviceId
 */
const useMediaDeviceInfoByKind$ = mediaDeviceInfoByKind$.createSelectorHook(
  (mediaDeviceInfoByKind) => mediaDeviceInfoByKind
);

export default useMediaDeviceInfoByKind$;

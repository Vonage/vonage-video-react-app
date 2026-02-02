import devicesStore from '../devicesStore';
import getMediaDeviceInfoByKind from '../helpers/getMediaDeviceInfoByKind';

/**
 * Media devices organized by kind and deviceId
 * This observable is synced with the devicesStore
 */
const mediaDeviceInfoByKind$ = devicesStore.createObservable(getMediaDeviceInfoByKind, {
  isEqualRoot: (prev, next) => prev.mediaDeviceInfo === next.mediaDeviceInfo,
});

export default mediaDeviceInfoByKind$;

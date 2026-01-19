import mediaDevicesStore from '../devicesStore';
import organizeMediaDevicesByKind from '../helpers/organizeMediaDevicesByKind';

/**
 * Media devices organized by kind and deviceId
 * This observable is synced with the mediaDevicesStore
 */
const mediaDevicesMap$ = mediaDevicesStore.createObservable(organizeMediaDevicesByKind, {
  isEqualRoot: (prev, next) => prev.mediaDeviceInfo === next.mediaDeviceInfo,
});

export default mediaDevicesMap$;

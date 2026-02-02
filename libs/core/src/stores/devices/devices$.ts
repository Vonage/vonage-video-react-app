import store from './devicesStore';

import { useMediaDeviceInfo, useMediaDevicesInfoByKind } from './hooks';

import { mediaDeviceInfoByKind$ } from './observables';

const devices$ = Object.assign(store, {
  // Hooks
  useMediaDeviceInfo,
  useMediaDevicesInfoByKind,

  // Observables
  mediaDeviceInfoByKind$,
});

export default devices$;

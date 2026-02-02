import type CancelablePromise from 'easy-cancelable-promise';
import { markDevicesApiMetadata } from '../assertions';

const metadata = () => {
  const meta = {
    /**
     * Static flag to know if the current platform support devicechange event
     */
    hasDeviceChangeCapability:
      typeof globalThis.navigator.mediaDevices?.ondevicechange !== 'undefined',

    loadingMediaDevices: null as null | CancelablePromise<MediaDeviceInfo[]>,

    // temporary backup for the local storage restored value
    // localstorage value needs to be confirmed against actual available devices
    restoredSelection: new Map<MediaDeviceKind, MediaDeviceInfo>(),
  };

  markDevicesApiMetadata(meta);

  return meta;
};

export default metadata;

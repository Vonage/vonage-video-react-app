import type CancelablePromise from 'easy-cancelable-promise';
import type { MediaDeviceInfoJSON } from '@web/types';
import { markDevicesApiMetadata } from '../assertions';
import { isSinkIdSupported } from '@web/platform';

const metadata = () => {
  const meta = {
    /**
     * Indicates if setSinkId is supported for audio output devices.
     */
    isSinkIdSupported: isSinkIdSupported(),

    /**
     * Static flag to know if the current platform support devicechange event
     */
    hasDeviceChangeCapability:
      typeof globalThis.navigator.mediaDevices?.ondevicechange !== 'undefined',

    loadingMediaDevices: null as null | CancelablePromise<MediaDeviceInfoJSON[]>,

    // temporary backup for the local storage restored value
    // localstorage value needs to be confirmed against actual available devices
    restoredSelection: new Map<MediaDeviceKind, MediaDeviceInfoJSON>(),
  };

  markDevicesApiMetadata(meta);

  return meta;
};

export default metadata;

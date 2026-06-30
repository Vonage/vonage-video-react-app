import CancelablePromise from 'easy-cancelable-promise';
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

    /**
     * This promise is used to track the ongoing loading of media devices, to prevent multiple simultaneous calls to getMediaDevicesInfo, which could cause race conditions
     */
    loadingMediaDevices: null as null | CancelablePromise<MediaDeviceInfoJSON[]>,

    /**
     * A promise that resolves when the media devices store is ready and full loaded with the available media devices.
     */
    isStoreReady: CancelablePromise.resolve(),

    /**
     * Tracks whether the next media devices query is the bootstrap query executed while the store readiness promise is still being created.
     */
    isFirstMediaDevicesInfoQuery: true,
  };

  markDevicesApiMetadata(meta);

  return meta;
};

export default metadata;

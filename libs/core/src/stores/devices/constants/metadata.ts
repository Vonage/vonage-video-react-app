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
     * allows us to delay syncs and queries until permissions are reviewed.
     */
    permissionsRequests: CancelablePromise.resolve(),

    /**
     * bound vanilla getUserMedia function
     */
    __getUserMedia: undefined as typeof globalThis.navigator.mediaDevices.getUserMedia | undefined,
  };

  markDevicesApiMetadata(meta);

  return meta;
};

export default metadata;

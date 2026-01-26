import type { NativeMediaDeviceInfo } from '../types';

/**
 * Gets native NativeMediaDeviceInfo list from browser API.
 * Returns branded type to avoid confusion with Vonage Device types.
 */
const getMediaDevices = async (): Promise<NativeMediaDeviceInfo[]> => {
  // native api is unlikely to change, we can safely assert the type here
  const devices =
    (await navigator.mediaDevices.enumerateDevices()) as unknown as NativeMediaDeviceInfo[];

  return devices;
};

export default getMediaDevices;

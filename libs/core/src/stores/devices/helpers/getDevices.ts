import { getDevices as getVonageDevices, Device, OTError } from '@vonage/client-sdk-video';

/**
 * Helper to get all media meta using Vonage Video API's getDevices method
 */
const getDevices = () =>
  new Promise<Device[]>((resolve, reject) => {
    getVonageDevices((err?: OTError, devices?: Device[]) => {
      if (err || !devices) {
        reject(err ?? new Error('Failed to get devices'));
        return;
      }

      resolve(devices);
    });
  });

export default getDevices;

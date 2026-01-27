import { getDevices as getVonageDevices } from '@vonage/client-sdk-video';
import type { Device } from '../schemas';

/**
 * Helper to get all media meta using Vonage Video API's getDevices method
 */
const getDevices = () =>
  new Promise<Device[]>((resolve, reject) => {
    getVonageDevices((err, devices) => {
      if (err || !devices) {
        reject(err ?? new Error('Failed to get devices'));
        return;
      }

      resolve(devices as Device[]);
    });
  });

export default getDevices;

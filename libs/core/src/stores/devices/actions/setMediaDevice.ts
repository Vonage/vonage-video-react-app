import { assertNativeMediaDeviceInfo } from '../schemas';
import getMediaDevices from '../helpers/getMediaDevices';
import type { DevicesAPI } from '../types';

/**
 * Sets the media input device by its device ID.
 */
function setMediaDevice(this: DevicesAPI['actions'], deviceId: string | null | undefined) {
  return async ({ setState }: DevicesAPI): Promise<void> => {
    // clean up media device
    if (deviceId === null) {
      setState((state) => ({
        ...state,
        selectedAudioInput: null,
        selectedVideoInput: null,
      }));

      return;
    }

    const devices = await getMediaDevices();
    const mediaDevice = devices.find((device) => device.deviceId === deviceId) ?? null;

    assertNativeMediaDeviceInfo(mediaDevice);

    // Update the appropriate selection based on device kind
    if (mediaDevice.kind === 'audioinput') {
      setState((state) => ({
        ...state,
        selectedAudioInput: mediaDevice,
      }));
    } else if (mediaDevice.kind === 'videoinput') {
      setState((state) => ({
        ...state,
        selectedVideoInput: mediaDevice,
      }));
    }
  };
}

export default setMediaDevice;

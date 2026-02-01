import {
  assertVonageAudioOutputDevice,
  type VonageAudioOutputDeviceId,
} from '../schemas/VonageAudioOutputDevice.schema';
import getAudioOutputDevices from '../helpers/getAudioOutputDevices';
import type { DevicesAPI } from '../types';

/**
 * Sets the audio output device by its device ID.
 */
function setAudioOutputDevice(
  this: DevicesAPI['actions'],
  deviceId: VonageAudioOutputDeviceId | null | undefined
) {
  return async ({ setState }: DevicesAPI): Promise<void> => {
    // clean up audio output device
    if (deviceId === null) {
      setState((state) => ({
        ...state,
        selectedAudioOutput: null,
      }));

      return;
    }

    const devices = await getAudioOutputDevices();
    const audioOutput = devices.find((device) => device.deviceId === deviceId) ?? null;

    assertVonageAudioOutputDevice(audioOutput);

    setState((state) => ({
      ...state,
      selectedAudioOutput: audioOutput,
    }));
  };
}

export default setAudioOutputDevice;

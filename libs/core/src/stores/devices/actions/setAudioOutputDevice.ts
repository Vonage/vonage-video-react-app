import {
  assertVonageAudioOutputDevice,
  type VonageAudioOutputDeviceId,
} from '../schemas/VonageAudioOutputDevice.schema';
import getAudioOutputDevices from '../helpers/getAudioOutputDevices';

export type DevicesApi = import('../devicesStore').DevicesApi;

/**
 * Sets the audio output device by its device ID.
 */
function setAudioOutputDevice(
  this: DevicesApi['actions'],
  deviceId: VonageAudioOutputDeviceId | null
) {
  return async ({ setState }: DevicesApi): Promise<void> => {
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

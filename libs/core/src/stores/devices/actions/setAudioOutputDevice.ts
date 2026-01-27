import {
  assertAudioOutputDevice,
  type AudioOutputDeviceId,
} from '../schemas/AudioOutputDevice.schema';
import getAudioOutputDevices from '../helpers/getAudioOutputDevices';

export type DevicesApi = import('../devicesStore').DevicesApi;

/**
 * Sets the audio output device by its device ID.
 */
function setAudioOutputDevice(this: DevicesApi['actions'], deviceId: AudioOutputDeviceId | null) {
  return async ({ setState }: DevicesApi): Promise<void> => {
    // clean up audio output device
    if (deviceId === null) {
      setState((state) => ({
        ...state,
        audioOutput: null,
      }));

      return;
    }

    const devices = await getAudioOutputDevices();
    const audioOutput = devices.find((device) => device.deviceId === deviceId) ?? null;

    assertAudioOutputDevice(audioOutput);

    setState((state) => ({
      ...state,
      audioOutput,
    }));
  };
}

export default setAudioOutputDevice;

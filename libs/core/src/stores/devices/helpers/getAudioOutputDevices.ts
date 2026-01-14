import {
  getAudioOutputDevices as getVonageAudioOutputDevices,
  AudioOutputDevice,
} from '@vonage/client-sdk-video';

const renameDefaultDevice = (
  audioOutput: AudioOutputDevice,
  defaultLabel = 'System Default'
): AudioOutputDevice =>
  audioOutput.deviceId === 'default' ? { ...audioOutput, label: defaultLabel } : audioOutput;

const getAudioOutputDevices = (defaultLabel = 'System Default') => {
  // Vonage Video API's getAudioOutputDevices retrieves all audio output devices (speakers)
  return getVonageAudioOutputDevices().then((audioOutputDevices) => {
    // Rename the label of the default audio output to the provided label
    return audioOutputDevices.map((device) => renameDefaultDevice(device, defaultLabel));
  });
};

export default getAudioOutputDevices;

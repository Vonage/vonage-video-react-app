import { getAudioOutputDevices as getVonageAudioOutputDevices } from '@vonage/client-sdk-video';
import renameDefaultAudioOutputDevice from '@utils/renameDefaultAudioOutputDevice';
import i18n from '../../../i18n';

const getAudioOutputDevices = () => {
  const t = i18n.t;

  // Vonage Video API's getAudioOutputDevices retrieves all audio output devices (speakers)
  return getVonageAudioOutputDevices().then((audioOutputDevices) => {
    // Rename the label of the default audio output to "System Default"
    return audioOutputDevices.map((device) =>
      renameDefaultAudioOutputDevice(device, t('devices.audio.defaultLabel'))
    );
  });
};

export default getAudioOutputDevices;

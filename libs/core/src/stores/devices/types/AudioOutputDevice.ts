import { AudioOutputDevice as VonageAudioOutputDevice } from '@vonage/client-sdk-video';
import { AudioOutputDeviceId } from '../schemas/AudioOutputDevice.schema';

export type AudioOutputDevice = Omit<VonageAudioOutputDevice, 'deviceId'> & {
  deviceId: AudioOutputDeviceId;
};

export default AudioOutputDevice;

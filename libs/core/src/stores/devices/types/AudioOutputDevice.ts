import { AudioOutputDevice as VonageAudioOutputDevice } from '@vonage/client-sdk-video';
import { VonageAudioOutputDeviceId } from '../schemas/VonageAudioOutputDevice.schema';

export type AudioOutputDevice = Omit<VonageAudioOutputDevice, 'deviceId'> & {
  deviceId: VonageAudioOutputDeviceId;
};

export default AudioOutputDevice;

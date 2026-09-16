import type { VonageAudioOutputDeviceId } from '@common/schemas';
import type { AudioOutputDevice as VonageAudioOutputDevice } from '@vonage/client-sdk-video';

export type AudioOutputDevice = Omit<VonageAudioOutputDevice, 'deviceId'> & {
  deviceId: VonageAudioOutputDeviceId;
};

export default AudioOutputDevice;

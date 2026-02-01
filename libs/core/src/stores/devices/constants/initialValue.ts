import type { VonageDevice, NativeMediaDeviceInfo } from '../schemas';
import type { AudioOutputDevice } from '../types';

/**
 * This store intent to manage all the media devices available on the client
 * and the selected devices for audio output, audio input and video input.
 */
const initialValue = () => ({
  // Collections
  devices: [] as VonageDevice[],
  mediaDevices: [] as NativeMediaDeviceInfo[],
  audioOutputDevices: [] as AudioOutputDevice[],

  // Selected audio output device
  selectedAudioOutput: null as AudioOutputDevice | null,

  // Selected input devices
  selectedAudioInput: null as NativeMediaDeviceInfo | null,
  selectedVideoInput: null as NativeMediaDeviceInfo | null,
});

export type InitialValue = ReturnType<typeof initialValue>;

export default initialValue;

import type { VonageDevice } from '../schemas';
import type { AudioOutputDevice } from '../types';

/**
 * This store intent to manage all the media devices available on the client
 * and the selected devices for audio output, audio input and video input.
 */
const initialValue = {
  // Collections
  devices: [] as VonageDevice[],
  mediaDevices: [] as MediaDeviceInfo[],
  audioOutputDevices: [] as AudioOutputDevice[],

  // Selected audio output device
  selectedAudioOutput: null as AudioOutputDevice | null,

  // Selected input devices
  selectedAudioInput: null as MediaDeviceInfo | null,
  selectedVideoInput: null as MediaDeviceInfo | null,
};

export type InitialValue = typeof initialValue;

export default initialValue;

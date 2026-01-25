import type { Device } from '../schemas';
import type { AudioOutputDevice } from '../types';

const initialValue = {
  // Collections
  devices: [] as Device[],
  mediaDevices: [] as MediaDeviceInfo[],
  audioOutputDevices: [] as AudioOutputDevice[],

  // Selected audio output device
  audioOutput: null as AudioOutputDevice | null,

  // Selected input devices
  audioInputDeviceId: null as MediaDeviceKind | null,
  videoInputDeviceId: null as MediaDeviceKind | null,
};

export type InitialValue = typeof initialValue;

export default initialValue;

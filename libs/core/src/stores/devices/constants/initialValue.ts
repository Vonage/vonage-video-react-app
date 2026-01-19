import type { Device } from '../schemas';
import type { AudioOutputDevice } from '../types';

const initialValue = {
  // Collections
  devices: [] as Device[],
  mediaDevices: [] as MediaDeviceInfo[],
  audioOutputDevices: [] as AudioOutputDevice[],

  // Selected devices
  audioOutput: null as AudioOutputDevice | null,
};

export type InitialValue = typeof initialValue;

export default initialValue;

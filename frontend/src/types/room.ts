import type { MediaDeviceInfoJSON } from '@web/types';

export type AllMediaDevices = {
  audioInputDevices: MediaDeviceInfoJSON[];
  videoInputDevices: MediaDeviceInfoJSON[];
  audioOutputDevices: MediaDeviceInfoJSON[];
};

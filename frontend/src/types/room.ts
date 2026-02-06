import type { MediaDeviceInfoJSON } from '@common/types';

export type AllMediaDevices = {
  audioInputDevices: MediaDeviceInfoJSON[];
  videoInputDevices: MediaDeviceInfoJSON[];
  audioOutputDevices: MediaDeviceInfoJSON[];
};

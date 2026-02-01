import z from 'zod';
import { VonageDeviceSchema } from './VonageDevice.schema';
import { VonageAudioOutputDeviceSchema } from './VonageAudioOutputDevice.schema';
import NativeMediaDeviceInfoSchema from './NativeMediaDeviceInfo.schema';

export const DevicesStoreSchema = z.object({
  // Collections
  devices: z.array(VonageDeviceSchema),
  mediaDevices: z.array(NativeMediaDeviceInfoSchema),
  audioOutputDevices: z.array(VonageAudioOutputDeviceSchema),

  // Selected devices
  selectedAudioOutput: VonageAudioOutputDeviceSchema.nullable(),
  selectedAudioInput: NativeMediaDeviceInfoSchema.nullable(),
  selectedVideoInput: NativeMediaDeviceInfoSchema.nullable(),
});

export type DevicesStoreState = z.infer<typeof DevicesStoreSchema>;

export function assertDevicesStoreState(data: unknown): asserts data is DevicesStoreState {
  DevicesStoreSchema.parse(data);
}

export default DevicesStoreState;

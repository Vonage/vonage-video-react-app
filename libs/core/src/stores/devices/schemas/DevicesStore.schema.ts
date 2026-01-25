import z from 'zod';
import { VonageDeviceSchema } from './VonageDevice.schema';
import { VonageAudioOutputDeviceSchema } from './VonageAudioOutputDevice.schema';
import MediaDeviceInfoSchema from './MediaDeviceInfo.schema';

export const DevicesStoreSchema = z.object({
  // Collections
  devices: z.array(VonageDeviceSchema),
  mediaDevices: z.array(MediaDeviceInfoSchema),
  audioOutputDevices: z.array(VonageAudioOutputDeviceSchema),

  // Selected devices
  selectedAudioOutput: VonageAudioOutputDeviceSchema.nullable(),
  selectedAudioInput: MediaDeviceInfoSchema.nullable(),
  selectedVideoInput: MediaDeviceInfoSchema.nullable(),
});

export type DevicesStore = z.infer<typeof DevicesStoreSchema>;

export function assertDevicesStore(data: unknown): asserts data is DevicesStore {
  DevicesStoreSchema.parse(data);
}

export default DevicesStore;

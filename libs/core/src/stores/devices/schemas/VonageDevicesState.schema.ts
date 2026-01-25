import z from 'zod';
import { VonageDeviceSchema } from './VonageDevice.schema';
import { VonageAudioOutputDeviceSchema } from './VonageAudioOutputDevice.schema';

export const DevicesStateSchema = z.object({
  // Collections
  devices: z.array(VonageDeviceSchema),
  audioOutputDevices: z.array(VonageAudioOutputDeviceSchema),

  // Selected devices
  audioOutput: VonageAudioOutputDeviceSchema.nullable(),
});

export type DevicesState = z.infer<typeof DevicesStateSchema>;

export function assertDevicesState(data: unknown): asserts data is DevicesState {
  DevicesStateSchema.parse(data);
}

export default DevicesState;

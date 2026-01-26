import z from 'zod';
import { DeviceSchema } from './Device.schema';
import { AudioOutputDeviceSchema } from './AudioOutputDevice.schema';

export const DevicesStateSchema = z.object({
  // Collections
  devices: z.array(DeviceSchema),
  audioOutputDevices: z.array(AudioOutputDeviceSchema),

  // Selected devices
  audioOutput: AudioOutputDeviceSchema.nullable(),
});

export type DevicesState = z.infer<typeof DevicesStateSchema>;

export function assertDevicesState(data: unknown): asserts data is DevicesState {
  DevicesStateSchema.parse(data);
}

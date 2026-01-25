import z from 'zod';
import { DeviceKindSchema } from './VonageDeviceKind.schema';

export const VonageDeviceId = z.string().brand('DeviceId');

export const VonageDeviceSchema = z.object({
  deviceId: VonageDeviceId,
  label: z.string(),
  kind: DeviceKindSchema,
});

export type VonageDeviceId = z.infer<typeof VonageDeviceId>;

export type VonageDevice = z.infer<typeof VonageDeviceSchema>;

export default VonageDevice;

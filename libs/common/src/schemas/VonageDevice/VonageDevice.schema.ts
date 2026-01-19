import z from 'zod';
import { VonageDeviceKindSchema } from '../VonageDeviceKind';

export const VonageDeviceId = z.string().brand('DeviceId');

export const VonageDeviceSchema = z.object({
  deviceId: VonageDeviceId,
  label: z.string(),
  kind: VonageDeviceKindSchema,
});

export type VonageDeviceId = z.infer<typeof VonageDeviceId>;

export type VonageDevice = z.infer<typeof VonageDeviceSchema>;

export default VonageDevice;

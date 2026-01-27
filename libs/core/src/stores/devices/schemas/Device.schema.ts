import z from 'zod';
import { DeviceKindSchema } from './DeviceKind.schema';

export const DeviceId = z.string().brand('DeviceId');

export const DeviceSchema = z.object({
  deviceId: DeviceId,
  label: z.string(),
  kind: DeviceKindSchema,
});

export type DeviceId = z.infer<typeof DeviceId>;

export type Device = z.infer<typeof DeviceSchema>;

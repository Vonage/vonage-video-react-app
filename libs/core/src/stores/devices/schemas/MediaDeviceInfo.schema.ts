import z from 'zod';
import { DeviceKindSchema } from './VonageDeviceKind.schema';

const MediaDeviceInfoSchema = z.object({
  deviceId: z.string(),
  kind: DeviceKindSchema,
  label: z.string(),
  groupId: z.string(),
});

export type MediaDeviceInfo = z.infer<typeof MediaDeviceInfoSchema>;

export function assertMediaDeviceInfo(data: unknown): asserts data is MediaDeviceInfo {
  MediaDeviceInfoSchema.parse(data);
}

export default MediaDeviceInfoSchema;

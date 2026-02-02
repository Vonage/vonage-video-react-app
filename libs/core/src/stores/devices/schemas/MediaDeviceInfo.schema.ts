import z from 'zod';
import DeviceKindSchema from './DeviceKindSchema.schema';

export type MediaDeviceInfoJSON = Omit<MediaDeviceInfo, 'toJSON'>;

/**
 * Native browser MediaDeviceInfo schema
 */
const MediaDeviceInfoSchema: z.ZodType<MediaDeviceInfoJSON> = z.object({
  deviceId: z.string(),
  kind: DeviceKindSchema,
  label: z.string(),
  groupId: z.string(),
});

export function assertMediaDeviceInfo(data: unknown): asserts data is MediaDeviceInfoJSON {
  MediaDeviceInfoSchema.parse(data);
}

export default MediaDeviceInfoSchema;

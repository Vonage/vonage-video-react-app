import z from 'zod';
import DeviceKindSchema from '../DeviceKind';

export type MediaDeviceInfoJSON = Omit<MediaDeviceInfo, 'toJSON'>;

/**
 * Native browser MediaDeviceInfo schema
 */
export const MediaDeviceInfoJSONSchema: z.ZodType<MediaDeviceInfoJSON> = z.looseObject({
  deviceId: z.string().min(1, 'deviceId cannot be empty'),
  kind: DeviceKindSchema,
  label: z.string(),
  groupId: z.string(),
});

export function assertMediaDeviceInfo(data: unknown): asserts data is MediaDeviceInfoJSON {
  MediaDeviceInfoJSONSchema.parse(data);
}

export default MediaDeviceInfoJSONSchema;

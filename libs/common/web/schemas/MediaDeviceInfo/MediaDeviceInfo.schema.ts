import z from 'zod';
import DeviceKindSchema from '../DeviceKind';
import { FacingMode } from '@common/types';
import { FacingModeSchema } from '@common/schemas';

export type MediaDeviceInfoJSON = Omit<MediaDeviceInfo, 'toJSON'> & {
  /**
   * FaceMode inferred from the device label.
   */
  inferredFacingMode?: FacingMode | null;
};

/**
 * Native browser MediaDeviceInfo schema
 */
export const MediaDeviceInfoJSONSchema: z.ZodType<MediaDeviceInfoJSON> = z.looseObject({
  deviceId: z.string().min(1, 'deviceId cannot be empty'),
  kind: DeviceKindSchema,
  label: z.string(),
  groupId: z.string(),
  inferredFacingMode: FacingModeSchema.nullable().optional(),
});

export function assertMediaDeviceInfo(data: unknown): asserts data is MediaDeviceInfoJSON {
  MediaDeviceInfoJSONSchema.parse(data);
}

export default MediaDeviceInfoJSONSchema;

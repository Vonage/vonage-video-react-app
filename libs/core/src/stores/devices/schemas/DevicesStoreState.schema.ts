import z from 'zod';
import MediaDeviceInfoSchema from './MediaDeviceInfo.schema';
import DeviceKindSchema from './DeviceKindSchema.schema';
import type { DevicesStoreState } from '../types/DevicesStoreState';

export const DevicesStoreSchema = z.object({
  mediaDeviceInfo: z.array(MediaDeviceInfoSchema),
  selection: z.map(DeviceKindSchema, MediaDeviceInfoSchema),
});

export function assertDevicesStoreState(data: unknown): asserts data is DevicesStoreState {
  DevicesStoreSchema.parse(data);
}

export function safelyParseDevicesStoreState(data: unknown) {
  return DevicesStoreSchema.safeParse(data) as z.ZodSafeParseResult<{
    mediaDeviceInfo: MediaDeviceInfo[];
    selection: Map<'audioinput' | 'videoinput' | 'audiooutput', MediaDeviceInfo>;
  }>;
}

export default DevicesStoreSchema;

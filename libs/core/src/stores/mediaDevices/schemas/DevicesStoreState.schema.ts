import z from 'zod';
import { MediaDeviceInfoJSON, MediaDeviceInfoJSONSchema, DeviceKindSchema } from '@web/schemas';
import type { DevicesStoreState } from '../types';

export const DevicesStoreSchema = z.intersection(
  z.object({
    mediaDeviceInfo: z.array(MediaDeviceInfoJSONSchema),
  }),
  z.record(DeviceKindSchema, z.string().optional())
);

export function assertDevicesStoreState(data: unknown): asserts data is DevicesStoreState {
  DevicesStoreSchema.parse(data);
}

export function safelyParseDevicesStoreState(data: unknown) {
  return DevicesStoreSchema.safeParse(data) as z.ZodSafeParseResult<
    {
      mediaDeviceInfo: MediaDeviceInfoJSON[];
    } & {
      [K in MediaDeviceKind]: MediaDeviceInfoJSON | undefined;
    }
  >;
}

export default DevicesStoreSchema;

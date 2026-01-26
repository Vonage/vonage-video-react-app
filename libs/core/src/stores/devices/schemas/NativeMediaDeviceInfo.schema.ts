import z from 'zod';

/**
 * Native browser MediaDeviceInfo kind (lowercase)
 * Different from Vonage DeviceKind which uses camelCase
 */
const NativeDeviceKindSchema = z.enum(['audioinput', 'videoinput', 'audiooutput']);

export type NativeDeviceKind = z.infer<typeof NativeDeviceKindSchema>;

/**
 * Native browser MediaDeviceInfo schema
 * Branded to ensure it only comes from navigator.mediaDevices.enumerateDevices()
 */
const NativeMediaDeviceInfoSchema = z
  .object({
    deviceId: z.string(),
    kind: NativeDeviceKindSchema,
    label: z.string(),
    groupId: z.string(),
  })
  .brand<'NativeMediaDeviceInfo'>();

export type NativeMediaDeviceInfo = z.infer<typeof NativeMediaDeviceInfoSchema>;

export function assertNativeMediaDeviceInfo(data: unknown): asserts data is NativeMediaDeviceInfo {
  NativeMediaDeviceInfoSchema.parse(data);
}

export default NativeMediaDeviceInfoSchema;

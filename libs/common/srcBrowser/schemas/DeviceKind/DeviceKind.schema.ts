import z from 'zod';

/**
 * Native browser MediaDeviceInfo kind (lowercase)
 * Different from Vonage DeviceKind which uses camelCase
 */
export const DeviceKindSchema = z.enum(['audioinput', 'videoinput', 'audiooutput']);

export function assertDeviceKind(data: unknown): asserts data is MediaDeviceKind {
  DeviceKindSchema.parse(data);
}

export default DeviceKindSchema;

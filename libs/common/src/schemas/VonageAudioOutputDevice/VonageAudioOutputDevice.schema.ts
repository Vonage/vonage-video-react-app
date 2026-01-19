import z from 'zod';

const VonageAudioOutputDeviceIdSchema = z.string().brand('AudioOutputDeviceId');

export const VonageAudioOutputDeviceSchema = z.object({
  deviceId: VonageAudioOutputDeviceIdSchema,
  label: z.string(),
});

export type VonageAudioOutputDeviceId = z.infer<typeof VonageAudioOutputDeviceIdSchema>;

export type VonageAudioOutputDevice = z.infer<typeof VonageAudioOutputDeviceSchema>;

export function assertVonageAudioOutputDevice(
  data: unknown
): asserts data is VonageAudioOutputDevice {
  VonageAudioOutputDeviceSchema.parse(data);
}

export default VonageAudioOutputDevice;

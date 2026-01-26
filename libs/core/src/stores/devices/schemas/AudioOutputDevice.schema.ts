import z from 'zod';

const AudioOutputDeviceIdSchema = z.string().brand('AudioOutputDeviceId');

export const AudioOutputDeviceSchema = z.object({
  deviceId: AudioOutputDeviceIdSchema,
  label: z.string(),
});

export type AudioOutputDeviceId = z.infer<typeof AudioOutputDeviceIdSchema>;

export type AudioOutputDevice = z.infer<typeof AudioOutputDeviceSchema>;

export function assertAudioOutputDevice(data: unknown): asserts data is AudioOutputDevice {
  AudioOutputDeviceSchema.parse(data);
}

export default AudioOutputDeviceSchema;

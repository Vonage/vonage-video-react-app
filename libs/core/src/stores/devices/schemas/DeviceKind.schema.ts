import z from 'zod';

export const DeviceKindSchema = z.enum(['audioInput', 'videoInput']).brand<'vonage'>();

export type DeviceKind = z.infer<typeof DeviceKindSchema>;

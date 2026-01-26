import z from 'zod';

export const DeviceKindSchema = z.enum(['audioInput', 'videoInput']);

export type DeviceKind = z.infer<typeof DeviceKindSchema>;

import z from 'zod';

export const VonageDeviceKindSchema = z.enum(['audioInput', 'videoInput']).brand<'vonage'>();

export type VonageDeviceKind = z.infer<typeof VonageDeviceKindSchema>;

export default VonageDeviceKind;

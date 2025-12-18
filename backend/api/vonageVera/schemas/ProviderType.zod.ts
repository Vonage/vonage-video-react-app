import z from 'zod';

export const ProviderTypeSchema = z.enum(['vonage', 'opentok']);

export type ProviderType = z.infer<typeof ProviderTypeSchema>;

export function assertProviderType(providerType: unknown): asserts providerType is ProviderType {
  ProviderTypeSchema.parse(providerType);
}

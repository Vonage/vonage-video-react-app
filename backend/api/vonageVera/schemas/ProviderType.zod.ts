import z from 'zod';

export const providerTypeSchema = z.enum(['vonage', 'opentok']);

export type ProviderType = z.infer<typeof providerTypeSchema>;

export function assertProviderType(providerType: unknown): asserts providerType is ProviderType {
  providerTypeSchema.parse(providerType);
}

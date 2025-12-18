import z from 'zod';
import { providerTypeSchema } from './ProviderType.zod';

export const vonageProviderConfigSchema = z.object({
  provider: providerTypeSchema.extract(['vonage']),
  applicationId: z.string(),
  privateKey: z.string(),
});

export type VonageProviderConfig = z.infer<typeof vonageProviderConfigSchema>;

export function assertVonageProviderConfig(
  config: unknown
): asserts config is VonageProviderConfig {
  vonageProviderConfigSchema.parse(config);
}

import z from 'zod';
import { ProviderTypeSchema } from './ProviderType.zod';

export const VonageProviderConfigSchema = z.object({
  provider: ProviderTypeSchema.extract(['vonage']),
  applicationId: z.string(),
  privateKey: z.string(),
});

export type VonageProviderConfig = z.infer<typeof VonageProviderConfigSchema>;

export function assertVonageProviderConfig(
  config: unknown
): asserts config is VonageProviderConfig {
  VonageProviderConfigSchema.parse(config);
}

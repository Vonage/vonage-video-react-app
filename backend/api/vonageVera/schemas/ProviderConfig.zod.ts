import z from 'zod';

import { OpentokProviderConfigSchema } from './OpentokProviderConfig.zod';
import { VonageProviderConfigSchema } from './VonageProviderConfig.zod';

export const ProviderConfigSchema = z.discriminatedUnion('provider', [
  VonageProviderConfigSchema,
  OpentokProviderConfigSchema,
]);

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

export function assertProviderConfig(config: unknown): asserts config is ProviderConfig {
  ProviderConfigSchema.parse(config);
}

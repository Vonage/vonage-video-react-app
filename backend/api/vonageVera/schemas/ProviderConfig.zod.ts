import z from 'zod';

import { opentokProviderConfigSchema } from './OpentokProviderConfig.zod';
import { vonageProviderConfigSchema } from './VonageProviderConfig.zod';
import { IStorageProvider, storageProviderSchema } from './StorageProvider.zod';

export const ProviderConfigSchema = z
  .object({
    storageProvider: storageProviderSchema,
  })
  .and(z.discriminatedUnion('provider', [vonageProviderConfigSchema, opentokProviderConfigSchema]));

export type ProviderConfig = z.infer<typeof ProviderConfigSchema> & {
  storageProvider: IStorageProvider;
};

export function assertProviderConfig(config: unknown): asserts config is ProviderConfig {
  ProviderConfigSchema.parse(config);
}

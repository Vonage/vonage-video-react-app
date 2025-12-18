import z from 'zod';
import { providerTypeSchema } from './ProviderType.zod';
import makeBadRequestErrorHandler from '@common/errors/handlers/makeBadRequestErrorHandler';

export const opentokProviderConfigSchema = z.object({
  provider: providerTypeSchema.extract(['opentok']),
  apiKey: z.string(),
  apiSecret: z.string(),
});

export type OpentokProviderConfig = z.infer<typeof opentokProviderConfigSchema>;

export function assertOpentokProviderConfig(
  config: unknown
): asserts config is OpentokProviderConfig {
  const result = opentokProviderConfigSchema.safeParse(config);

  if (!result.success) {
    throw makeBadRequestErrorHandler(result.error.message)(result.error);
  }
}

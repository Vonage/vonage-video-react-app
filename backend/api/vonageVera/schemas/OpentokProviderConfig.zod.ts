import z from 'zod';
import { ProviderTypeSchema } from './ProviderType.zod';
import makeBadRequestErrorHandler from '@common/errors/handlers/makeBadRequestErrorHandler';

export const OpentokProviderConfigSchema = z.object({
  provider: ProviderTypeSchema.extract(['opentok']),
  apiKey: z.string(),
  apiSecret: z.string(),
});

export type OpentokProviderConfig = z.infer<typeof OpentokProviderConfigSchema>;

export function assertOpentokProviderConfig(
  config: unknown
): asserts config is OpentokProviderConfig {
  const result = OpentokProviderConfigSchema.safeParse(config);

  if (!result.success) {
    throw makeBadRequestErrorHandler(result.error.message)(result.error);
  }
}

import z from 'zod';
import { AuthParamsSchema, AuthParams } from './AuthParams.schema';
import ConfigParamsSchema from './ConfigParams.schema';
import { Auth } from '@vonage/auth';
import { makeBadRequestErrorHandler } from '@api-lib/errors';

export const VideoClientConfigSchema = z.object({
  auth: AuthParamsSchema.or(z.instanceof(Auth)),
  videoParams: ConfigParamsSchema.optional(),
}) satisfies z.ZodType<VideoClientConfig>;

export type VideoClientConfig = {
  auth: AuthParams | Auth;

  videoParams?: z.infer<typeof ConfigParamsSchema>;
};

export function assertVideoClientConfig(config: unknown): asserts config is VideoClientConfig {
  const { error } = VideoClientConfigSchema.safeParse(config);

  if (error) {
    throw makeBadRequestErrorHandler('Invalid video client config')(error);
  }
}

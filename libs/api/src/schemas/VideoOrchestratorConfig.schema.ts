import z from 'zod';
import { AuthParamsSchema, AuthParams } from './AuthParams.schema';
import ConfigParamsSchema from './ConfigParams.schema';
import { Auth } from '@vonage/auth';
import { makeBadRequestErrorHandler } from '@api-lib/errors';

export const VideoOrchestratorConfigSchema = z.object({
  auth: AuthParamsSchema.or(z.instanceof(Auth)),
  videoParams: ConfigParamsSchema.optional(),
}) satisfies z.ZodType<VideoOrchestratorConfig>;

export type VideoOrchestratorConfig = {
  auth: AuthParams | Auth;

  videoParams?: z.infer<typeof ConfigParamsSchema>;
};

export function assertVideoOrchestratorConfig(
  config: unknown
): asserts config is VideoOrchestratorConfig {
  const { error } = VideoOrchestratorConfigSchema.safeParse(config);

  if (error) {
    throw makeBadRequestErrorHandler('Invalid video orchestrator config')(error);
  }
}

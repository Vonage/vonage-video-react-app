import z from 'zod';
import { AuthParamsSchema, AuthParams } from './AuthParams.schema';
import ConfigParamsSchema from './ConfigParams.schema';
import { SessionSigningSchema, type SessionSigning } from './SessionSigning.schema';
import { Auth } from '@vonage/auth';
import { makeBadRequestErrorHandler } from '@api-lib/errors';
import type { HandlersDefaults } from '@api-lib/types';

export const VideoClientConfigSchema = z.object({
  auth: AuthParamsSchema.or(z.instanceof(Auth)),
  videoParams: ConfigParamsSchema.optional(),
  handlersDefaults: z.object({}).loose().optional(),
  sessionSigning: SessionSigningSchema.optional(),
}) satisfies z.ZodType<VideoClientConfig>;

export type VideoClientConfig = {
  /**
   * Vonage API authentication parameters
   */
  auth: AuthParams | Auth;

  /**
   * Vonage Video API configuration parameters
   */
  videoParams?: z.infer<typeof ConfigParamsSchema>;

  /**
   * Allows you to define defaults values for the video actions
   */
  handlersDefaults?: Partial<HandlersDefaults>;

  /**
   * Optional configuration for signing session keys. This provides lightweight integrity verification of session keys,
   * Helps ensure consistency when associating sessions with an application.
   * Not intended for authentication or authorization.
   */
  sessionSigning?: SessionSigning;
};

export function assertVideoClientConfig(config: unknown): asserts config is VideoClientConfig {
  const { error } = VideoClientConfigSchema.safeParse(config);

  if (error) {
    throw makeBadRequestErrorHandler('Invalid video client config')(error);
  }
}

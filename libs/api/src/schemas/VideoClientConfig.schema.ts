import z from 'zod';
import { AuthParamsSchema, AuthParams } from './AuthParams.schema';
import ConfigParamsSchema from './ConfigParams.schema';
import { SessionSigningSchema, type SessionSigning } from './SessionSigning.schema';
import { ExtensionConfigSchema, type ExtensionConfig } from './ExtensionConfig.schema';
import { ExtensionStoreSchema } from './ExtensionStore.schema';
import { Auth } from '@vonage/auth';
import { makeBadRequestErrorHandler } from '@api-lib/errors';
import type { ExtensionStore, HandlersDefaults } from '@api-lib/types';

export const VideoClientConfigSchema = z.object({
  auth: AuthParamsSchema.or(z.instanceof(Auth)),
  videoParams: ConfigParamsSchema.optional(),
  handlersDefaults: z.object({}).loose().optional(),
  sessionSigning: SessionSigningSchema.optional(),
  extension: ExtensionConfigSchema.optional(),
  extensionStore: ExtensionStoreSchema.optional(),
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

  /**
   * How much a single extension of a running scheduled session can add. Defaults to `{ options: [20, 40, 60] }`.
   */
  extension?: ExtensionConfig;

  /**
   * Resolves concurrent extensions of the same session. Defaults to a process-wide in-memory store;
   * provide a shared store when several server instances handle the same sessions.
   */
  extensionStore?: ExtensionStore;
};

export function assertVideoClientConfig(config: unknown): asserts config is VideoClientConfig {
  const { error } = VideoClientConfigSchema.safeParse(config);

  if (error) {
    throw makeBadRequestErrorHandler('Invalid video client config')(error);
  }
}

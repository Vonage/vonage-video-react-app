import { z } from 'zod';
import { AuthParamsSchema } from './AuthParams.schema';
import ConfigParamsSchema from './ConfigParams.schema';
import TRPCRuntimeConfigOptionsSchema from './TRPCRuntimeConfigOptions.schema';
import { Auth } from '@vonage/auth';
import type { Any, Prettify } from '@common/types';
import { makeBadRequestErrorHandler } from '@api-lib/errors';
import { SessionSigningSchema } from './SessionSigning.schema';
import type { HandlersConfig, VideoClientConfig } from '@api-lib/types';
import { TRPCRuntimeConfigOptions } from '@trpc/server';

type IVideoClientConfig = Omit<VideoClientConfig, 'handlersDefaults'>;

// Forces the VideoRouterConfigSchema to match the VideoClientConfig type
type IVideoClientConfigSchema = {
  [K in keyof IVideoClientConfig]-?: z.ZodType<IVideoClientConfig[K]>;
};

const BaseVideoRouterConfigSchema = z.object({
  routerOptions: TRPCRuntimeConfigOptionsSchema.optional(),
  handlersConfig: z.object({}).loose().optional(),
});

export const VideoRouterConfigSchema = BaseVideoRouterConfigSchema.extend({
  auth: AuthParamsSchema.or(z.instanceof(Auth)),
  videoParams: ConfigParamsSchema.optional(),
  sessionSigning: SessionSigningSchema.optional(),
} satisfies IVideoClientConfigSchema) satisfies z.ZodType<VideoRouterConfig<Any, Any>>;

export type VideoRouterConfig<TContext extends object, TMeta extends object> = Prettify<
  {
    [K in keyof IVideoClientConfig]: IVideoClientConfig[K];
  } & {
    // extensions
    handlersConfig?: Partial<HandlersConfig>;
    routerOptions?: TRPCRuntimeConfigOptions<TContext, TMeta>;
  }
>;

export function assertVideoRouterConfig(
  config: unknown
): asserts config is VideoRouterConfig<Any, Any> {
  const { error } = VideoRouterConfigSchema.safeParse(config);

  if (error) {
    throw makeBadRequestErrorHandler('Invalid video router configuration')(error);
  }
}

export default VideoRouterConfigSchema;

import { z } from 'zod';
import { AuthParamsSchema, AuthParams } from './AuthParams.schema';
import ConfigParamsSchema from './ConfigParams.schema';
import TRPCRuntimeConfigOptionsSchema from './TRPCRuntimeConfigOptions.schema';
import { Auth } from '@vonage/auth';
import type { TRPCRuntimeConfigOptions } from '@trpc/server';
import type { ConfigParams } from '@vonage/server-client';
import type { Any } from '@common/types';
import { makeBadRequestErrorHandler } from '@api-lib/errors';
import type { HandlersConfig } from '@api-lib/types';

export const VideoRouterConfigSchema: z.ZodType<VideoRouterConfig<Any, Any, Any>> = z.object({
  auth: AuthParamsSchema.or(z.instanceof(Auth)),
  videoParams: ConfigParamsSchema.optional(),
  routerOptions: TRPCRuntimeConfigOptionsSchema.optional(),
  handlersConfig: z.object({}).loose().optional(),
});

export type VideoRouterConfig<
  TContext extends object,
  TMeta extends object,
  Handlers extends Partial<HandlersConfig>,
> = {
  auth: AuthParams | Auth;
  videoParams?: ConfigParams;
  routerOptions?: TRPCRuntimeConfigOptions<TContext, TMeta>;
  handlersConfig?: Handlers;
};

export function assertVideoRouterConfig(
  config: unknown
): asserts config is VideoRouterConfig<Any, Any, Any> {
  const { error } = VideoRouterConfigSchema.safeParse(config);

  if (error) {
    throw makeBadRequestErrorHandler('Invalid video router configuration')(error);
  }
}

export default VideoRouterConfigSchema;

import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { videoRouterContext } from '@api-lib/constants';
import type { VideoClient } from '@api-lib/core';
import type { VideoRouterConfig } from '@api-lib/schemas';
import createVideoRouter from '../videoRouter';
import type { HandlersConfig } from '@api-lib/types';

/**
 * Creates a video handler:
 * The handler is a an express router with all the video capabilities required by Vera
 */
function createVideoHandler<
  TContext extends {
    [videoRouterContext]: {
      orchestrator: VideoClient;
    };
  },
  TMeta extends object,
  Handlers extends Partial<HandlersConfig>,
  TConfig extends VideoRouterConfig<TContext, TMeta, Handlers> &
    Omit<Parameters<typeof createExpressMiddleware>[0], 'router'>,
>({ auth, videoParams, routerOptions, handlersConfig, ...routerConfig }: TConfig) {
  return createExpressMiddleware({
    router: createVideoRouter({ auth, videoParams, routerOptions, handlersConfig }),

    createContext: () => ({}) as TContext,

    ...routerConfig,
  });
}

export default createVideoHandler;

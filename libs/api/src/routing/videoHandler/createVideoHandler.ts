import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { VideoClient } from '@api-lib/core';
import type { VideoRouterConfig } from '@api-lib/schemas';
import createVideoRouter from '../videoRouter';
import { Prettify } from '@common/types';

/**
 * Creates a video handler:
 * The handler is a an express router with all the video capabilities required by Vera
 */
function createVideoHandler<
  TContext extends Record<string, unknown>,
  TMeta extends object = object,
  Context extends {
    videoClient: VideoClient;
  } = Prettify<
    TContext & {
      videoClient: VideoClient;
    }
  >,
>({
  auth,
  videoParams,
  routerOptions,
  handlersConfig,
  ...routerConfig
}: VideoRouterConfig<Context, TMeta> &
  Omit<Parameters<typeof createExpressMiddleware>[0], 'router'>) {
  const router$ = createVideoRouter({ auth, videoParams, routerOptions, handlersConfig });
  const { transform$, override$, use$, makeVideoClient$ } = router$;

  return Object.assign(
    createExpressMiddleware({
      router: router$,

      createContext: () => ({}) as Context,

      ...routerConfig,
    }),
    { transform$, override$, use$, makeVideoClient$, router$ }
  );
}

export default createVideoHandler;

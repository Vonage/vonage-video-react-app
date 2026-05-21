import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { VideoClient } from '@api-lib/core';
import type { VideoRouterConfig } from '@api-lib/schemas';
import createVideoRouter, {
  CustomMiddlewareParameters,
  InputOf,
  NextResult,
  OnSettledParameters,
  OutputOf,
  ProcedureResolverOptions,
  PublicActionKey,
} from '../videoRouter';
import { Any, Prettify } from '@common/types';

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
  const {
    transform$,
    override$,
    use$: use$Base,
    onSettled$: onSettled$Base,
    makeVideoClient$,
  } = router$;

  type Extensions = typeof extensions;

  const middleware = createExpressMiddleware({
    router: router$,

    createContext: () => ({}) as Context,

    ...routerConfig,
  });

  type VideoHandler = typeof middleware & Extensions;

  /**
   * Use this callback to run custom code before the original handlers, for example to implement custom authorization logic.
   *
   * @example Middleware for all actions
   * ```ts
   * videoHandler.use$(async ({ videoAction, ctx, input, next }) => {
   *    ...
   * });
   * ```
   */
  function use$(
    this: VideoHandler,
    middleware: (opts: CustomMiddlewareParameters<Any, Context>) => NextResult | Promise<NextResult>
  ): VideoHandler;

  /**
   * Use this callback to run custom code before the original handlers, for example to implement custom authorization logic.
   *
   * @example Middleware for a specific action
   * ```ts
   * videoHandler.use$('joinSession', async ({ ctx, input, next }) => {
   *    ...
   * });
   * ```
   */
  function use$<ActionKey extends PublicActionKey, Result = InputOf<ActionKey>>(
    this: typeof extensions,
    actionKey: ActionKey,
    handler: (opts: CustomMiddlewareParameters<Result, Context>) => NextResult | Promise<NextResult>
  ): VideoHandler;

  function use$<ActionKey extends PublicActionKey>(
    this: typeof extensions,
    arg1:
      | ActionKey
      | ((opts: CustomMiddlewareParameters<Any, Context>) => NextResult | Promise<NextResult>),
    arg2?: (opts: CustomMiddlewareParameters<Any, Context>) => NextResult | Promise<NextResult>
  ): VideoHandler {
    const args = [arg1, arg2] as Parameters<typeof use$Base>;

    use$Base.call(router$, ...args);

    return middleware as VideoHandler;
  }

  function onSettled$(
    this: VideoHandler,
    handler: (opts: OnSettledParameters<Any, Any, Context>) => void | Promise<void>
  ): VideoHandler;

  function onSettled$<
    ActionKey extends PublicActionKey,
    Output = OutputOf<ActionKey>,
    Input = InputOf<ActionKey>,
  >(
    this: VideoHandler,
    actionKey: ActionKey,
    handler: (opts: OnSettledParameters<Output, Input, Context>) => void | Promise<void>
  ): VideoHandler;

  function onSettled$<ActionKey extends PublicActionKey>(
    this: typeof extensions,
    arg1: ActionKey | ((opts: OnSettledParameters<Any, Any, Context>) => void | Promise<void>),
    arg2?: (opts: OnSettledParameters<Any, Any, Context>) => void | Promise<void>
  ): VideoHandler {
    const args = [arg1, arg2] as Parameters<typeof onSettled$Base>;

    onSettled$Base.call(router$, ...args);

    return middleware as VideoHandler;
  }

  const extensions = {
    /**
     * Use this callback if you need to transform the raw input before it's evaluated by the handlers,
     * For example adding extra properties to the input
     */
    transform$<ActionKey extends PublicActionKey, Input = InputOf<ActionKey>>(
      actionKey: ActionKey,
      transform: (input: unknown) => Input | Promise<Input>
    ) {
      transform$(actionKey, transform);
      return middleware as VideoHandler;
    },

    /**
     * Use this callback to completely override the handler of a specific action.
     */
    override$<
      ActionKey extends PublicActionKey,
      Input = InputOf<ActionKey>,
      Output = Awaited<ReturnType<VideoClient[ActionKey]>>,
    >(
      actionKey: ActionKey,
      handler: (opts: ProcedureResolverOptions<Input, Context>) => Output | Promise<Output>
    ) {
      override$(actionKey, handler);
      return middleware as VideoHandler;
    },

    use$,

    onSettled$,

    makeVideoClient$: (...args: Parameters<typeof makeVideoClient$>) => {
      return makeVideoClient$(...args);
    },

    router$,
  };

  return Object.assign(middleware, extensions);
}

export default createVideoHandler;

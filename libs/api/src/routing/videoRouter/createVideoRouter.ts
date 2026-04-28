import { initTRPC, TRPCBuilder, type AnyMutationProcedure } from '@trpc/server';
import {
  assertVideoRouterConfig,
  CreateSessionAndJoinPayloadSchema,
  JoinSessionPayloadSchema,
  type VideoRouterConfig,
} from '@api-lib/schemas';
import { VideoClient } from '@api-lib/core';
import type { HandlerConfig, HandlersConfig, HandlersDefaults } from '@api-lib/types';
import { VideoAction } from '@api-lib/types';
import { Any, Prettify } from '@common/types';
import { makeBadRequestErrorHandler, makeInternalErrorHandler } from '@api-lib/errors';
import { toTRPCError } from '@api-lib/errors/helpers';
import { schemasByAction } from '@api-lib/constants';
import { assertResult } from '@common/execution';
import { isFunction } from '@common/assertions';

export const OKAY = Symbol('OKAY');

const OKAY_RESULT = { [OKAY]: true } as NextResult;

function createVideoRouter<
  TContext extends Record<string, unknown>,
  TMeta extends object,
  Context extends {
    videoClient: VideoClient;
  } = Prettify<
    TContext & {
      videoClient: VideoClient;
    }
  >,
>(routerConfig: VideoRouterConfig<Context, TMeta>) {
  assertVideoRouterConfig(routerConfig);

  const { auth, videoParams, routerOptions, handlersConfig } = routerConfig;

  const handlersDefaults: HandlersDefaults = Object.fromEntries(
    Object.entries(handlersConfig ?? {}).map(([action, config]) => [action, config?.addDefaults])
  );

  const trpcRoot = (initTRPC as unknown as TRPCBuilder<Context, TMeta>).create({
    errorFormatter: ({ error: unsafeError }) => {
      const error = makeInternalErrorHandler('An internal error occurred')(
        unsafeError.cause ?? unsafeError
      );

      return toTRPCError(error);
    },
    ...routerOptions,
  });

  // prettify is necessary to hide the internal TRPC types and prevent d.ts errors.
  type TRPCRouter = Prettify<typeof router>;

  type Middleware = Parameters<typeof trpcRoot.procedure.use>[0];

  /**
   * These maps are used to store the custom logic added by the transform$, override$ and use$ callbacks.
   * The keys are the action names and the values are the corresponding callbacks.
   * When a request is made, we check if there's a custom callback for the action and execute it if it exists.
   */
  const transforms = new Map<PublicActionKey, (input: unknown) => unknown>();
  const overrides = new Map<
    PublicActionKey,
    (opts: ProcedureResolverOptions<Any, Context>) => Any
  >();

  const middlewaresPerAction = new Map<
    PublicActionKey | null,
    ((opts: CustomMiddlewareParameters<Any, Context>) => NextResult | Promise<NextResult>)[]
  >();

  const tryAssertInput = <ActionKey extends PublicActionKey>(
    actionKey: ActionKey,
    input: unknown
  ) => {
    return assertResult(
      () => schemasByAction[actionKey].parse(input),
      makeBadRequestErrorHandler(`Invalid input for action ${actionKey}`)
    );
  };

  const setupPipeline: Middleware = async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.videoClient) ctx.videoClient = makeVideoClient$();

    const actionKey = extractProcedureKey(opts.path);
    const globalMiddlewares = middlewaresPerAction.get(null) ?? [];
    const actionMiddlewares = middlewaresPerAction.get(actionKey) ?? [];
    const middlewares = [...globalMiddlewares, ...actionMiddlewares];

    if (!middlewares.length) return next();

    try {
      const rawInput = await opts.getRawInput();
      const unwrappedInput = unwrapTrpcInput(rawInput);

      const args = Object.assign(opts, {
        input: unwrappedInput,
        assertInput: (input: unknown) => tryAssertInput(actionKey, input),
        next: innerNextFn,
        videoAction: actionKey,
        videoClient: ctx.videoClient,
      }) as CustomMiddlewareParameters<Any, Context>;

      function innerNextFn(opts$?: InnerNextParameters<Any, Context>): NextResult {
        if (!opts$) return OKAY_RESULT;

        if (opts$.ctx) {
          args.ctx = {
            ...args.ctx,
            ...opts$.ctx,
          };
        }

        if (Object.hasOwn(opts$, 'input')) {
          args.input = opts$.input;
        }

        return OKAY_RESULT;
      }

      for (const middleware of middlewares) {
        const result = await middleware(args);

        if (!result[OKAY]) {
          throw makeInternalErrorHandler(
            `Middleware for action ${actionKey} did not return next()`
          )(null);
        }
      }

      return next({
        getRawInput: () => Promise.resolve(args.input),
      });
    } catch (error) {
      throw makeInternalErrorHandler(`Failed to initialize pipeline for action ${actionKey}`)(
        error
      );
    }
  };

  // We used callbacks to easily track the videoClient methods and their types
  const router = trpcRoot.router({
    createSession: makeMutation({
      key: VideoAction.createSession,
      config: handlersConfig?.createSession,
      callback: (videoClient, input) => {
        return videoClient.createSession(input);
      },
    }),

    startArchive: makeMutation({
      key: VideoAction.startArchive,
      config: handlersConfig?.startArchive,
      callback: (videoClient, input) => {
        return videoClient.startArchive(input);
      },
    }),

    stopArchive: makeMutation({
      key: VideoAction.stopArchive,
      config: handlersConfig?.stopArchive,
      callback: (videoClient, input) => {
        return videoClient.stopArchive(input);
      },
    }),

    searchArchives: makeMutation({
      key: VideoAction.searchArchives,
      config: handlersConfig?.searchArchives,
      callback: (videoClient, input) => {
        return videoClient.searchArchives(input);
      },
    }),

    enableCaptions: makeMutation({
      key: VideoAction.enableCaptions,
      config: handlersConfig?.enableCaptions,
      callback: (videoClient, input) => {
        return videoClient.enableCaptions(input);
      },
    }),

    ensureCaptionsEnabled: makeMutation({
      key: VideoAction.ensureCaptionsEnabled,
      config: handlersConfig?.enableCaptions,
      callback: (videoClient, input) => {
        return videoClient.ensureCaptionsEnabled(input);
      },
    }),

    disableCaptions: makeMutation({
      key: VideoAction.disableCaptions,
      config: handlersConfig?.disableCaptions,
      callback: (videoClient, input) => {
        return videoClient.disableCaptions(input);
      },
    }),

    joinSession: makeMutation({
      key: VideoAction.joinSession,
      config: {
        transformInput: (opts) => {
          // potentially allow extra properties as long as the basic schema is valid
          const {
            clientTokenOptions: {
              // remove sensitive options from the input
              role: _role,
              expireTime: _expireTime,

              ...clientTokenOptions
            } = {},
            ...rest
          } = JoinSessionPayloadSchema.loose().parse(opts.input);

          const input = {
            ...rest,
            clientTokenOptions,
          };

          return handlersConfig?.joinSession?.transformInput?.({ ...opts, input }) ?? input;
        },
        defaults: handlersConfig?.joinSession?.addDefaults,
      },
      callback: (videoClient, input) => {
        return videoClient.joinSession(input);
      },
    }),

    createSessionAndJoin: makeMutation({
      key: VideoAction.createSessionAndJoin,
      config: {
        transformInput: (opts) => {
          // potentially allow extra properties as long as the basic schema is valid
          const {
            clientTokenOptions: {
              // remove sensitive options from the input
              role: _role,
              expireTime: _expireTime,

              ...clientTokenOptions
            } = {},
            ...rest
          } = CreateSessionAndJoinPayloadSchema.loose().optional().parse(opts.input) ?? {};

          const input = {
            ...rest,
            clientTokenOptions,
          };

          return (
            handlersConfig?.createSessionAndJoin?.transformInput?.({ ...opts, input }) ?? input
          );
        },

        /**
         * Combines the defaults of createSession and joinSession handlers
         */
        addDefaults: (() => {
          if (handlersConfig?.createSessionAndJoin?.addDefaults) {
            return handlersConfig.createSessionAndJoin.addDefaults;
          }

          if (!handlersConfig?.createSession && !handlersConfig?.joinSession) {
            return undefined;
          }

          const createSessionDefaults = (
            isFunction(handlersConfig?.createSession?.addDefaults)
              ? handlersConfig.createSession.addDefaults
              : (payload: unknown) => payload
          ) as (payload: unknown) => Record<string, unknown>;

          const joinSessionDefaults = (
            isFunction(handlersConfig?.joinSession?.addDefaults)
              ? handlersConfig.joinSession.addDefaults
              : (payload: unknown) => payload
          ) as (payload: unknown) => Record<string, unknown>;

          return (input) => ({
            ...input,
            ...(createSessionDefaults(input) ?? {}),
            ...(joinSessionDefaults(input) ?? {}),
          });
        })() as HandlersConfig['createSessionAndJoin']['addDefaults'],
      },
      callback: async (videoClient, input) => {
        return videoClient.createSessionAndJoin(input);
      },
    }),
  }) satisfies IVideoRouterContract;

  function unwrapTrpcInput(rawInput: unknown): unknown {
    if (
      rawInput &&
      typeof rawInput === 'object' &&
      'json' in rawInput &&
      Object.keys(rawInput).length === 1
    ) {
      return (rawInput as { json: unknown }).json;
    }

    return rawInput;
  }

  function makeInput<
    ActionKey extends PublicActionKey,
    Config extends HandlerConfig<AsActionKey<ActionKey>, Parameters<VideoClient[ActionKey]>[0]>,
  >(videoAction: ActionKey, config: Config | undefined) {
    type Input = Parameters<VideoClient[ActionKey]>[0];

    // input validation is performed by video videoClient handlers
    // trpc requires an input schema to parse the request body, so we provide dummy parser with the correct type
    const parser = (input: unknown): Input => {
      if (!config?.transformInput) return input as Input;

      return config.transformInput({
        input,
        assertInput: (val: unknown) => tryAssertInput(videoAction, val),
      }) as Input;
    };

    const input = trpcRoot.procedure.use(setupPipeline).input(async (rawInput) => {
      try {
        const unwrappedInput = unwrapTrpcInput(rawInput);
        const transform = transforms.get(videoAction);
        if (transform) return parser(await transform(unwrappedInput));

        return parser(unwrappedInput);
      } catch (error) {
        throw makeInternalErrorHandler(`Failed to parse input for action ${videoAction}`)(error);
      }
    });

    return { input, parser };
  }

  function makeMutation<
    ActionKey extends PublicActionKey,
    Action extends (
      videoClient: VideoClient,
      input: Parameters<VideoClient[ActionKey]>[0]
    ) => ReturnType<VideoClient[ActionKey]>,
    Config extends HandlerConfig<AsActionKey<ActionKey>, Parameters<VideoClient[ActionKey]>[0]>,
  >({ key, callback, config }: { key: ActionKey; callback: Action; config: Config | undefined }) {
    const { input, parser } = makeInput(key, config);

    return input.mutation(async (opts) => {
      try {
        const override = overrides.get(key);

        if (override) {
          const args = Object.assign(opts, {
            assertInput: (input: unknown) => tryAssertInput(key, input),
            videoClient: opts.ctx.videoClient,
          }) as ProcedureResolverOptions<unknown, Context>;

          return override(args) as ReturnType<Action>;
        }

        const input = parser(opts.input) as Parameters<VideoClient[ActionKey]>[0];

        return callback(opts.ctx.videoClient, input) as unknown as ReturnType<Action>;
      } catch (error) {
        throw makeInternalErrorHandler(`Failed to execute mutation ${key}`)(error);
      }
    });
  }

  function extractProcedureKey(path: string): PublicActionKey {
    const i = path.lastIndexOf('.');
    return (i === -1 ? path : path.slice(i + 1)) as PublicActionKey;
  }

  function makeVideoClient$() {
    return new VideoClient({
      auth,
      videoParams,
      handlersDefaults,
    });
  }

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
    this: typeof extensions,
    middleware: (opts: CustomMiddlewareParameters<Any, Context>) => NextResult | Promise<NextResult>
  ): typeof extensions;

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
  ): typeof extensions;

  function use$<ActionKey extends PublicActionKey>(
    this: typeof extensions,
    arg1:
      | ActionKey
      | ((opts: CustomMiddlewareParameters<Any, Context>) => NextResult | Promise<NextResult>),
    arg2?: (opts: CustomMiddlewareParameters<Any, Context>) => NextResult | Promise<NextResult>
  ) {
    const actionKey = arg2 ? (arg1 as ActionKey) : null;
    const handler = (arg2 ?? arg1) as (
      opts: CustomMiddlewareParameters<Any, Context>
    ) => NextResult | Promise<NextResult>;

    let middlewares = middlewaresPerAction.get(actionKey);
    if (!middlewares) middlewaresPerAction.set(actionKey, (middlewares = []));

    middlewares.push(
      handler as (
        opts: CustomMiddlewareParameters<Any, Context>
      ) => NextResult | Promise<NextResult>
    );

    return this;
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
      transforms.set(actionKey, transform);
      return extensions;
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
      overrides.set(actionKey, handler);
      return extensions;
    },

    /**
     * Use this callback to run custom code before the original handlers, for example to implement custom authorization logic.
     */
    use$,

    /**
     * Make a vonage client instance with the configuration provided to the router.
     */
    makeVideoClient$,
  } as const;

  return Object.assign(router as TRPCRouter, extensions);
}

export type IVideoRouter = ReturnType<typeof createVideoRouter>;

type IVideoRouterContract = {
  // exclude private handlers
  [K in Exclude<`${VideoAction}`, 'createEphemeralToken'>]: AnyMutationProcedure;
};

export type PublicActionKey = keyof IVideoRouterContract;

export type AsActionKey<T> = T extends VideoAction ? T : never;

export type NextResult = {
  [OKAY]: true;
};

export type ProcedureResolverOptions<
  Input,
  Context extends {
    videoClient: VideoClient;
  },
> = {
  ctx: Context;
  path: string;
  signal: AbortSignal | undefined;
  batchIndex?: number | undefined;
  input: unknown;

  /**
   * Use this function to validate the input against the Zod schema for the given action. It will throw a TRPCError with code 'BAD_REQUEST' if the validation fails.
   *
   * @example
   * ```ts
   * const { assertInput } = opts;
   * const input = assertInput(opts.input); // input is now correctly typed and validated
   * ```
   */
  assertInput(input: unknown): Input;

  /**
   * Contains known video client methods
   */
  videoClient: VideoClient;
};

export type InnerNextFn<Input, Context extends { videoClient: VideoClient }> = {
  (): NextResult;

  (opts: { ctx?: Context; input?: Input }): NextResult;
};

export type InnerNextParameters<Input, Context extends { videoClient: VideoClient }> = Parameters<
  InnerNextFn<Input, Context>
>[0];

export type CustomMiddlewareParameters<
  Result,
  Context extends { videoClient: VideoClient },
> = Prettify<
  ProcedureResolverOptions<Result, Context> & {
    next: InnerNextFn<Result, Context>;
    videoAction: VideoAction;
  }
>;

export type InputOf<ActionKey extends PublicActionKey> = Parameters<VideoClient[ActionKey]>[0];

export default createVideoRouter;

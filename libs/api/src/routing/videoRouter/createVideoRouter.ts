import {
  initTRPC,
  TRPCBuilder,
  type AnyQueryProcedure,
  type AnyMutationProcedure,
} from '@trpc/server';
import { assertVideoRouterConfig, type VideoRouterConfig } from '@api-lib/schemas';
import { VideoClient } from '@api-lib/core';
import type { HandlerConfig } from '@api-lib/types';
import { VideoAction } from '@api-lib/types';
import { Any, Prettify } from '@common/types';
import { makeBadRequestErrorHandler, makeInternalErrorHandler } from '@api-lib/errors';
import { toTRPCError } from '@api-lib/errors/helpers';
import { schemasByAction } from '@api-lib/constants';
import type { HandlersDefaults } from '@api-lib/types';
import { assertResult } from '@common/execution';

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

  type ProcedureResolverOptions<Result> = {
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
    assertInput(input: unknown): Result;

    /**
     * Contains known video client methods
     */
    videoClient: VideoClient;
  };

  type InnerNextFn<Input> = {
    (): NextResult;

    (opts: { ctx?: Context; input?: Input }): NextResult;
  };

  type InnerNextParameters<Input> = Parameters<InnerNextFn<Input>>[0];

  type CustomMiddlewareParameters<Result> = Prettify<
    ProcedureResolverOptions<Result> & {
      next: InnerNextFn<Result>;
      videoAction: VideoAction;
    }
  >;

  type Middleware = Parameters<typeof trpcRoot.procedure.use>[0];

  type InputOf<ActionKey extends PublicActionKey> = Parameters<VideoClient[ActionKey]>[0];

  /**
   * These maps are used to store the custom logic added by the transform$, override$ and use$ callbacks.
   * The keys are the action names and the values are the corresponding callbacks.
   * When a request is made, we check if there's a custom callback for the action and execute it if it exists.
   */
  const transforms = new Map<PublicActionKey, (input: unknown) => unknown>();
  const overrides = new Map<PublicActionKey, (opts: ProcedureResolverOptions<Any>) => Any>();

  const middlewaresPerAction = new Map<
    PublicActionKey | null,
    ((opts: CustomMiddlewareParameters<Any>) => NextResult | Promise<NextResult>)[]
  >();

  const tryAssertInput = <ActionKey extends PublicActionKey>(
    actionKey: ActionKey,
    input: unknown
  ) => {
    return assertResult(
      () => schemasByAction[actionKey].parse(input),
      makeBadRequestErrorHandler(`Invalid payload for action ${actionKey}`)
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
      }) as CustomMiddlewareParameters<Any>;

      function innerNextFn(opts$?: InnerNextParameters<Any>): NextResult {
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

  // We used callbacks to easily track the orchestrator methods and their types
  const router = trpcRoot.router({
    createSession: makeMutation({
      key: VideoAction.createSession,
      config: handlersConfig?.createSession,
      callback: (orchestrator, payload) => {
        return orchestrator.createSession(payload);
      },
    }),

    createSessionAndJoin: makeMutation({
      key: VideoAction.createSessionAndJoin,
      config: handlersConfig?.createSessionAndJoin,
      callback: async (orchestrator, payload) => {
        return orchestrator.createSessionAndJoin(payload);
      },
    }),

    startArchive: makeMutation({
      key: VideoAction.startArchive,
      config: handlersConfig?.startArchive,
      callback: (orchestrator, payload) => {
        return orchestrator.startArchive(payload);
      },
    }),

    stopArchive: makeMutation({
      key: VideoAction.stopArchive,
      config: handlersConfig?.stopArchive,
      callback: (orchestrator, payload) => {
        return orchestrator.stopArchive(payload);
      },
    }),

    searchArchives: makeQuery({
      key: VideoAction.searchArchives,
      config: handlersConfig?.searchArchives,
      callback: (orchestrator, payload) => {
        return orchestrator.searchArchives(payload);
      },
    }),

    enableCaptions: makeMutation({
      key: VideoAction.enableCaptions,
      config: handlersConfig?.enableCaptions,
      callback: (orchestrator, payload) => {
        return orchestrator.enableCaptions(payload);
      },
    }),

    ensureCaptionsEnabled: makeMutation({
      key: VideoAction.ensureCaptionsEnabled,
      config: handlersConfig?.ensureCaptionsEnabled,
      callback: (orchestrator, payload) => {
        return orchestrator.ensureCaptionsEnabled(payload);
      },
    }),

    disableCaptions: makeMutation({
      key: VideoAction.disableCaptions,
      config: handlersConfig?.disableCaptions,
      callback: (orchestrator, payload) => {
        return orchestrator.disableCaptions(payload);
      },
    }),

    joinSession: makeMutation({
      key: VideoAction.joinSession,
      config: {
        selectInput: (payload) => {
          const { clientTokenOptions: options, ...rest } =
            handlersConfig?.joinSession?.selectInput?.(payload) ?? payload;

          const { role: _role, expireTime: _expireTime, ...clientTokenOptions } = options ?? {};

          const input = {
            ...rest,
            clientTokenOptions,
          };

          return input as Prettify<
            Required<typeof rest> & {
              clientTokenOptions?: typeof clientTokenOptions;
            }
          >;
        },
        defaults: handlersConfig?.joinSession?.defaults,
      },
      callback: (orchestrator, payload) => {
        return orchestrator.joinSession(payload);
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
    Config extends HandlerConfig<ActionKey, Parameters<VideoClient[ActionKey]>[0]>,
  >(videoAction: ActionKey, config: Config | undefined) {
    type Input = Parameters<VideoClient[ActionKey]>[0];

    // input validation is performed by video orchestrator handlers
    // trpc requires an input schema to parse the request body, so we provide dummy parser with the correct type
    const parser = (config?.selectInput ?? ((val: unknown) => val)) as (val: unknown) => Input;

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
      orchestrator: VideoClient,
      payload: Parameters<VideoClient[ActionKey]>[0]
    ) => ReturnType<VideoClient[ActionKey]>,
    Config extends HandlerConfig<ActionKey, Parameters<VideoClient[ActionKey]>[0]>,
  >({ key, callback, config }: { key: ActionKey; callback: Action; config: Config | undefined }) {
    const { input, parser } = makeInput(key, config);

    return input.mutation(async (opts) => {
      try {
        const override = overrides.get(key);

        if (override) {
          const args = Object.assign(opts, {
            assertInput: (input: unknown) => tryAssertInput(key, input),
            videoClient: opts.ctx.videoClient,
          }) as ProcedureResolverOptions<unknown>;

          return override(args) as ReturnType<Action>;
        }

        const payload = parser(opts.input) as Parameters<VideoClient[ActionKey]>[0];

        return callback(opts.ctx.videoClient, payload) as unknown as ReturnType<Action>;
      } catch (error) {
        throw makeInternalErrorHandler(`Failed to execute mutation ${key}`)(error);
      }
    });
  }

  function makeQuery<
    ActionKey extends PublicActionKey,
    Action extends (
      orchestrator: VideoClient,
      payload: Parameters<VideoClient[ActionKey]>[0]
    ) => ReturnType<VideoClient[ActionKey]>,
    Config extends HandlerConfig<ActionKey, Parameters<VideoClient[ActionKey]>[0]>,
  >({ key, callback, config }: { key: ActionKey; callback: Action; config: Config | undefined }) {
    const { input, parser } = makeInput(key, config);

    return input.query(async (opts) => {
      try {
        const override = overrides.get(key);
        if (override) {
          const args = Object.assign(opts, {
            assertInput: (input: unknown) => tryAssertInput(key, input),
            videoClient: opts.ctx.videoClient,
          }) as ProcedureResolverOptions<unknown>;

          return override(args) as ReturnType<VideoClient[ActionKey]>;
        }

        const payload = parser(opts.input) as Parameters<VideoClient[ActionKey]>[0];

        return callback(opts.ctx.videoClient, payload);
      } catch (error) {
        throw makeInternalErrorHandler(`Failed to execute query ${key}`)(error);
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
      handlersDefaults: routerConfig as Partial<HandlersDefaults>,
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
    middleware: (opts: CustomMiddlewareParameters<Any>) => NextResult | Promise<NextResult>
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
    handler: (opts: CustomMiddlewareParameters<Result>) => NextResult | Promise<NextResult>
  ): typeof extensions;

  function use$<ActionKey extends PublicActionKey>(
    this: typeof extensions,
    arg1: ActionKey | ((opts: CustomMiddlewareParameters<Any>) => NextResult | Promise<NextResult>),
    arg2?: (opts: CustomMiddlewareParameters<Any>) => NextResult | Promise<NextResult>
  ) {
    const actionKey = arg2 ? (arg1 as ActionKey) : null;
    const handler = (arg2 ?? arg1) as (
      opts: CustomMiddlewareParameters<Any>
    ) => NextResult | Promise<NextResult>;

    let middlewares = middlewaresPerAction.get(actionKey);
    if (!middlewares) middlewaresPerAction.set(actionKey, (middlewares = []));

    middlewares.push(
      handler as (opts: CustomMiddlewareParameters<Any>) => NextResult | Promise<NextResult>
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
      handler: (opts: ProcedureResolverOptions<Input>) => Output | Promise<Output>
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
  [K in Exclude<VideoAction, 'createEphemeralToken'>]: AnyQueryProcedure | AnyMutationProcedure;
};

type PublicActionKey = keyof IVideoRouterContract;

export type NextResult = {
  [OKAY]: true;
};

export default createVideoRouter;

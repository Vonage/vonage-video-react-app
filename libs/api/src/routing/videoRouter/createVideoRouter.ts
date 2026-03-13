import {
  initTRPC,
  TRPCBuilder,
  type AnyQueryProcedure,
  type AnyMutationProcedure,
} from '@trpc/server';
import { assertVideoRouterConfig, type VideoRouterConfig } from '@api-lib/schemas';
import { VideoClient } from '@api-lib/core';
import type { HandlerConfig, HandlersConfig } from '@api-lib/types';
import { VideoAction } from '@api-lib/types';
import { Any, Prettify } from '@common/types';
import { videoRouterContext } from '@api-lib/constants';
import { makeInternalErrorHandler } from '@api-lib/errors';
import { toTRPCError } from '@api-lib/errors/helpers';

function createVideoRouter<
  TContext extends {
    [videoRouterContext]: {
      orchestrator: VideoClient;
    };
  },
  TMeta extends object,
  Handlers extends Partial<HandlersConfig>,
>(routerConfig: VideoRouterConfig<TContext, TMeta, Handlers>) {
  assertVideoRouterConfig(routerConfig);

  const { auth, videoParams, routerOptions, handlersConfig } = routerConfig;

  const trpcRoot = (initTRPC as unknown as TRPCBuilder<TContext, TMeta>).create({
    errorFormatter: ({ error: unsafeError }) => {
      const error = makeInternalErrorHandler('An internal error occurred')(
        unsafeError.cause ?? unsafeError
      );

      return toTRPCError(error);
    },
    ...routerOptions,
  });

  const makeOrchestrator: Parameters<typeof trpcRoot.procedure.use>[0] = async ({ ctx, next }) => {
    ctx[videoRouterContext] = {
      orchestrator: new VideoClient({ auth, videoParams }),
    };

    return next();
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

    decodeSessionId: makeQuery({
      key: VideoAction.decodeSessionId,
      config: handlersConfig?.decodeSessionId,
      callback: (orchestrator, payload) => {
        return orchestrator.decodeSessionId(payload);
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

    disableCaptions: makeMutation({
      key: VideoAction.disableCaptions,
      config: handlersConfig?.disableCaptions,
      callback: (orchestrator, payload) => {
        return orchestrator.disableCaptions(payload);
      },
    }),

    joinSession: makeMutation({
      key: VideoAction.joinSession,
      config: handlersConfig?.joinSession,
      callback: (orchestrator, payload) => {
        return orchestrator.joinSession(payload);
      },
    }),
  }) satisfies IVideoRouterContract;

  function makeInput<
    ActionKey extends VideoAction,
    Config extends HandlerConfig<ActionKey, Parameters<VideoClient[ActionKey]>[0]>,
  >(_videoAction: ActionKey, config: Config | undefined) {
    type Input = Parameters<VideoClient[ActionKey]>[0];
    type SelectInput = Config['selectInput'] extends (...args: Any[]) => infer R ? R : Input;

    // input validation is performed by video orchestrator handlers
    // trpc requires an input schema to parse the request body, so we provide dummy parser with the correct type
    const parser = (config?.selectInput ?? ((val: unknown) => val)) as (
      val: unknown
    ) => SelectInput;

    const input = trpcRoot.procedure.use(makeOrchestrator).input(parser);

    return { input, parser };
  }

  function makeMutation<
    ActionKey extends VideoAction,
    Action extends (
      orchestrator: VideoClient,
      payload: Parameters<VideoClient[ActionKey]>[0]
    ) => ReturnType<VideoClient[ActionKey]>,
    Config extends HandlerConfig<ActionKey, Parameters<VideoClient[ActionKey]>[0]>,
  >({ key, callback, config }: { key: ActionKey; callback: Action; config: Config | undefined }) {
    const { input, parser } = makeInput(key, config);

    return input.mutation(async (opts) => {
      const payload = parser(opts.input) as Parameters<VideoClient[ActionKey]>[0];
      const orchestrator = opts.ctx[videoRouterContext].orchestrator;

      return callback(orchestrator, payload);
    });
  }

  function makeQuery<
    ActionKey extends VideoAction,
    Action extends (
      orchestrator: VideoClient,
      payload: Parameters<VideoClient[ActionKey]>[0]
    ) => ReturnType<VideoClient[ActionKey]>,
    Config extends HandlerConfig<ActionKey, Parameters<VideoClient[ActionKey]>[0]>,
  >({ key, callback, config }: { key: ActionKey; callback: Action; config: Config | undefined }) {
    const { input, parser } = makeInput(key, config);

    return input.query(async (opts) => {
      const payload = parser(opts.input) as Parameters<VideoClient[ActionKey]>[0];
      const orchestrator = opts.ctx[videoRouterContext].orchestrator;

      return callback(orchestrator, payload);
    });
  }

  // prettify is necessary to hide the internal TRPC types and prevent d.ts errors.
  return Object.assign(router as Prettify<typeof router>, {
    override(_method: string, _path: string, _handler: Any) {
      throw new Error('Overriding handlers is not implemented yet');
    },
  });
}

export type IVideoRouter = ReturnType<typeof createVideoRouter>;

type IVideoRouterContract = {
  // exclude private handlers
  [K in Exclude<VideoAction, 'createEphemeralToken'>]: AnyQueryProcedure | AnyMutationProcedure;
};

export default createVideoRouter;

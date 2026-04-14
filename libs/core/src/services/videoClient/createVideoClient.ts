// eslint-disable-next-line @nx/enforce-module-boundaries
import type { IVideoRouter } from '../../../../api/src/types/IVideoRouter';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { Prettify, Any, AnyFunction } from '@common/types';

/**
 * Creates a video client for interacting with the video API.
 *
 * @example
 * ```ts
 * const videoClient = createVideoClient({
 *   url: 'http://localhost:4000/trpc',
 * });
 *
 * videoClient.createSession(); // creates a new session
 * videoClient.createSession({ sessionId: 'existing-session-id' }); // uses an existing session
 * ```
 */
function createVideoClient(linkOptions: LinkOptions): VideoClient<IVideoRouter>;

/**
 * Creates a video client for interacting with the video API.
 *
 * @example
 * ```ts
 * const videoClient = createVideoClient({
 *   links: [
 *     httpBatchLink<IVideoRouter>({
 *       url: 'http://localhost:4000/trpc',
 *     }),
 *   ],
 * });
 *
 * videoClient.createSession(); // creates a new session
 * videoClient.createSession({ sessionId: 'existing-session-id' }); // uses an existing session
 * ```
 */
function createVideoClient(links: Links): VideoClient<IVideoRouter>;

function createVideoClient(args: Links | LinkOptions): VideoClient<IVideoRouter> {
  const options: Options = (() => {
    if (Array.isArray(args)) {
      return { links: args };
    }

    return {
      links: [httpBatchLink<IVideoRouter>(args)],
    };
  })();

  const trpcClient = createTRPCClient<IVideoRouter>(options);

  // make the proxy flatter for a better developer experience, so instead of videoClient.createSession.mutate() it's just videoClient.createSession()
  const proxy = new Proxy(trpcClient, {
    get(target, property: string) {
      const procedure = target[property as keyof typeof target];

      if (!procedure) {
        throw new Error(`Procedure ${property} does not exist on the video client`);
      }

      return (procedure as MutateProcedure).mutate;
    },
  }) as unknown as VideoClient<IVideoRouter>;

  return proxy;
}

type AnyRouter = {
  [K in Extract<keyof IVideoRouter, string>]: Any;
};

type VideoClientBase<Router extends AnyRouter> = ReturnType<typeof createTRPCClient<Router>>;

type MutateProcedure = {
  mutate: AnyFunction;
};

type VideoClient<Router extends AnyRouter> = Prettify<{
  [K in keyof VideoClientBase<Router>]: VideoClientBase<Router>[K] extends MutateProcedure
    ? VideoClientBase<Router>[K]['mutate']
    : VideoClientBase<Router>[K];
}>;

type Options = Prettify<Parameters<typeof createTRPCClient<IVideoRouter>>[0]>;

type Links = Options['links'];

type LinkOptions = Parameters<typeof httpBatchLink<IVideoRouter>>[0];

export default createVideoClient;

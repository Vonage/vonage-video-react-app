// eslint-disable-next-line @nx/enforce-module-boundaries
import type { IVideoRouter } from '../../../../api/src/types/IVideoRouter';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { Prettify, AnyFunction } from '@common/types';

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
function createVideoClient(linkOptions: LinkOptions): VideoClient;

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
function createVideoClient(links: Links): VideoClient;

function createVideoClient(args: Links | LinkOptions): VideoClient {
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
  }) as unknown as VideoClient;

  return proxy;
}

type VideoClientBase = ReturnType<typeof createTRPCClient<IVideoRouter>>;

type MutateProcedure = {
  mutate: AnyFunction;
};

type Normalize<T> = {
  [K in keyof T]: T[K] extends MutateProcedure ? T[K]['mutate'] : T[K];
};

type OnlyFunctions<T> = {
  [K in keyof T as T[K] extends AnyFunction ? K : never]: T[K];
};

type SanitizedVideoClient = OnlyFunctions<Normalize<VideoClientBase>>;

/**
 * Video client to communicate with a vonage video handler.
 */
export type VideoClient = Prettify<SanitizedVideoClient>;

type Options = Prettify<Parameters<typeof createTRPCClient<IVideoRouter>>[0]>;

type Links = Options['links'];

type LinkOptions = Parameters<typeof httpBatchLink<IVideoRouter>>[0];

export default createVideoClient;

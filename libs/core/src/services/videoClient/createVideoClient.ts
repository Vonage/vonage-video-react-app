// eslint-disable-next-line @nx/enforce-module-boundaries
import type { IVideoRouter } from '../../../../api/src/types/IVideoRouter';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { Prettify } from '@common/types';

type VideoClient = Prettify<ReturnType<typeof createTRPCClient<IVideoRouter>>>;

type Options = Prettify<Parameters<typeof createTRPCClient<IVideoRouter>>[0]>;

type Links = Options['links'];

type LinkOptions = Parameters<typeof httpBatchLink<IVideoRouter>>[0];

/**
 * Creates a video client for interacting with the video API.
 *
 * @example
 * ```ts
 * const videoClient = createVideoClient({
 *   url: 'http://localhost:4000/trpc',
 * });
 *
 * videoClient.createSession.mutate(); // creates a new session
 * videoClient.createSession.mutate({ sessionId: 'existing-session-id' }); // uses an existing session
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
 * videoClient.createSession.mutate(); // creates a new session
 * videoClient.createSession.mutate({ sessionId: 'existing-session-id' }); // uses an existing session
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

  return trpcClient;
}

export default createVideoClient;

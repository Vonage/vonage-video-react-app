import { type Mockable, SPY_MARK } from '@common/types/Mockable';
import type * as module from '@vonage/video';
import { vi } from 'vitest';
import { isFunction } from '@common/assertions';
import { mockModule, setupPartialMock } from '@common-test/helpers';
import type { Any } from '@common/types';

type Module = typeof module;

type VideoInstance = InstanceType<Module['Video']>;

export type VideoMock = Partial<
  Omit<Mockable<Module>, 'Video'> & {
    Video?:
      | Mockable<VideoInstance>
      | ((args: {
          instance: VideoInstance;
          spyOn: (mocks: Mockable<VideoInstance>) => void;
        }) => void);
  }
>;

/**
 * @example
 * ```ts
 * vi.mock('@vonage/video', async () => {
 *   const actual = await vi.importActual('@vonage/video');
 *
 *   return mockVideoModule(actual, {
 *     Video: {
 *       createSession: { sessionId: 'mock-session-id' },
 *       generateClientToken: 'mock-token',
 *     },
 *   });
 * });
 * ```
 */
const mockVideoModule = <T extends VideoMock>(
  actual: Any,
  mock: T | ((spy: typeof SPY_MARK) => T)
): Module => {
  const actual$ = actual as Module;
  const mock$ = (isFunction(mock) ? mock(SPY_MARK) : mock) as VideoMock;
  const { Video, ...rest } = mock$;

  const Video$ = (() => {
    if (!mock$.Video) return actual$.Video;

    const OriginalVideo = actual$.Video;

    return vi.fn((...args: ConstructorParameters<Module['Video']>) => {
      const instance = new OriginalVideo(...args);
      const spyOn = (mocks: Mockable<VideoInstance>) => {
        setupPartialMock<VideoInstance>('Video instance', instance, mocks);
      };

      if (!isFunction(mock$.Video)) {
        return spyOn(Video as Mockable<VideoInstance>);
      }

      mock$.Video({ instance, spyOn });

      return instance;
    });
  })();

  return mockModule<Module>({ ...actual$, Video: Video$ } as Module, rest);
};

export default mockVideoModule;

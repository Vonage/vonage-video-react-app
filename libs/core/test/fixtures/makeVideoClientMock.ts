import type { Mocked } from 'vitest';
import type { VideoClient } from '@core/services';
import { AnyFunction } from '@common/types';
import { isFunction, isNil } from '@common/assertions';

type VideoClientFnMock<K extends keyof VideoClient, Result = Awaited<ReturnType<VideoClient[K]>>> =
  | Promise<Result>
  | VideoClient[K];

type VideoClientMock = Partial<{
  [K in keyof VideoClient]: VideoClientFnMock<K>;
}>;

const makeVideoClientMock = (mock: VideoClientMock): Mocked<VideoClient> => {
  const target: Record<string, AnyFunction> = {};

  Object.keys(mock).forEach((key) => {
    const value = mock[key as keyof VideoClientMock];

    if (!isFunction(value)) {
      target[key] = vi.fn(() => value);
      return;
    }

    if (vi.isMockFunction(value)) {
      target[key] = value as AnyFunction;
      return;
    }

    target[key] = vi.fn(value);
  });

  return new Proxy(target, {
    get(target, prop: string) {
      const value = target[prop as keyof VideoClientMock];

      if (isNil(value)) {
        throw new Error(`Method ${prop} has not been implemented in the mock`);
      }

      return value;
    },
  }) as Mocked<VideoClient>;
};

export default makeVideoClientMock;

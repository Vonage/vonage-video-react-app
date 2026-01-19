import isFunction from '@common/assertions/isFunction';
import { Any } from '@common/types';
import { vi } from 'vitest';

/**
 * Creates a generic mock with the provided TYPE and implementation.
 * The result is a proxy who warms of whatever access to a non-existing withing the mock
 */
function makeGenericMock<T extends object>(
  description: string,
  mock: Partial<T>
): ReturnType<typeof vi.mocked<T>> {
  Object.keys(mock).forEach((key) => {
    const value = mock[key as keyof T];

    // is already a spy skip
    if (vi.isMockFunction(value)) return;

    // add the spy implementation for the function
    if (isFunction(value)) {
      vi.spyOn(mock, key as Any).mockImplementation(value);
      return;
    }
  });

  return vi.mocked(
    new Proxy(mock as T, {
      get(target, prop) {
        if (Object.hasOwn(target, prop)) return target[prop as keyof T];
        throw new Error(`Property ${String(prop)} does not exist on mock: ${description}`);
      },
    })
  );
}

export default makeGenericMock;

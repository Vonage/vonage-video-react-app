import { isFunction } from '@common/assertions';
import { type Mockable, SPY_MARK } from '@common/types';
import type { Any } from 'react-hooks-global-states';
import { vi } from 'vitest';

/**
 * Makes a generic mock for the provided target object based on the given mock implementation.
 * The mock implementation can be either an object with properties to mock or a function that returns such an object.
 * For each property in the mock implementation:
 */
const makeGenericMock = <T extends object>(args: {
  description: string;
  actual: T;
  mock: Partial<Mockable<T>> | ((spy: typeof SPY_MARK) => Partial<Mockable<T>>);
}): ReturnType<typeof vi.mocked<T>> => {
  const { description: entityName, actual: target, mock } = args;
  const source = (isFunction(mock) ? mock(SPY_MARK) : mock) as Partial<Mockable<T>>;
  const entries = Object.keys(source);

  // mock functions based on the provided source
  entries.forEach((key) => {
    const newValue = source[key as keyof T];
    const currentValue = target[key as keyof T];
    const shouldSpy = newValue === SPY_MARK;

    if (shouldSpy) {
      // spy all the functions on the target without changing their implementation
      if (isFunction(currentValue)) {
        (target as Any)[key] = vi.fn(currentValue.bind(target));
        return;
      }

      return;
    }

    // cannot modify non-function properties, throw an error to avoid silent test failures
    if (!isFunction(currentValue)) {
      throw new Error(
        `Cannot mock property ${key} on target object. ${entityName}.${key} is not a function`
      );
    }

    // if the parameter is a function, use it as the implementation for the mock
    if (isFunction(newValue)) {
      (target as Any)[key] = vi.fn(newValue);
      return;
    }

    // if the parameter is not a function, use it as the return value for the mock
    (target as Any)[key] = vi.fn(() => newValue);
  });

  return vi.mocked(target);
};

export default makeGenericMock;

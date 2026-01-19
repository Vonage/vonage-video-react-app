import isFunction from '@common/assertions/isFunction';
import { Any, AnyFunction } from '@common/types';
import { type Mockable, SPY_MARK } from '@common/types/Mockable';
import { vi, afterEach } from 'vitest';

const RESTORES = Symbol('mockModule:restores');
const HOOKED = new WeakSet<object>();

/**
 * Creates a partial mock for the provided target object based on the given source object.
 * By default spies on functionality without overriding the implementation
 * 
 * @example
 * ```tsx
 * import * as platform from '@web/platform';
 
   return mockModule(
     '@web/platform',
     platform,
     {
       isSinkIdSupported: false,
     }
   ); // returns { ...module, isSinkIdSupported: vi.fn().mockReturnValue(false) }
 * ```
 */
function mockModule<T extends object>(
  actual: T,
  mock: Partial<Mockable<T>> | ((spy: typeof SPY_MARK) => Partial<Mockable<T>>)
): T {
  ensureCleanupHook(actual);

  const source = (isFunction(mock) ? mock(SPY_MARK) : mock) as Partial<Mockable<T>>;
  const entries = Object.keys(source);

  // mock functions based on the provided source
  entries.forEach((key) => {
    const value = source[key as keyof T];
    const currentValue = actual[key as keyof T];

    // trying to mock or override something that does not exist on the target
    if (!Object.hasOwn(actual, key)) {
      throw new Error(`Cannot mock/override property ${key}. The target property does not exist.`);
    }

    // Spy the function without modifying its implementation
    if (value === SPY_MARK) {
      if (isFunction(currentValue)) {
        (actual as Any)[key] = vi.fn(currentValue as AnyFunction);
        return;
      }

      throw new Error(`Cannot spy on property ${key} on target object. ${key} is not a function`);
    }

    // if the parameter is a function, use it as the implementation for the mock
    if (isFunction(value)) {
      (actual as Any)[key] = vi.fn(value as AnyFunction);
      return;
    }

    // if the target is a function, use the parameter as the return value for the mock
    if (isFunction(currentValue)) {
      (actual as Any)[key] = vi.fn(() => value);
      return;
    }

    // schedule property restore after each test
    pushRestore(actual, key);
    (actual as Any)[key] = value;
  });

  return actual;
}

function ensureCleanupHook(target: object) {
  if (HOOKED.has(target)) return;
  HOOKED.add(target);

  afterEach(() => {
    const entries = ((target as Any)[RESTORES] ?? []) as RestoreEntry[];

    for (let i = entries.length - 1; i >= 0; i--) {
      const { key, hadOwn, value } = entries[i];

      if (!hadOwn) {
        delete (target as Any)[key];
      } else {
        (target as Any)[key] = value;
      }
    }

    (target as Any)[RESTORES] = [];
  });
}

function pushRestore(target: object, key: string) {
  const hadOwn = Object.prototype.hasOwnProperty.call(target, key);
  const prev = hadOwn ? (target as Any)[key] : undefined;

  const entries = ((target as Any)[RESTORES] ??= []) as RestoreEntry[];
  entries.push({ key, hadOwn, value: prev });
}

type RestoreEntry = { key: string; hadOwn: boolean; value: unknown };

export default mockModule;

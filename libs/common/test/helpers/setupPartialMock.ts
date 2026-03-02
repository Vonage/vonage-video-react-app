import isFunction from '@common/assertions/isFunction';
import { type Mockable, SPY_MARK } from '@common/types/Mockable';
import type { Any } from 'react-hooks-global-states';
import { vi, afterEach } from 'vitest';

const RESTORES = Symbol('setupPartialMock:restores');
const HOOKED = new WeakSet<object>();

/**
 * Creates a partial mock for the provided target object based on the given source object.
 * By default spies on functionality without overriding the implementation
 * 
 * @example
 * ```tsx
 * import * as platform from '@web/platform';
 
   return setupPartialMock(
     '@web/platform',
     platform,
     {
       isSinkIdSupported: false,
     }
   ); // returns { ...module, isSinkIdSupported: vi.fn().mockReturnValue(false) }
 * ```
 */
function setupPartialMock<T extends object>(
  description: string,
  target: T,
  mock: Partial<Mockable<T>>
): ReturnType<typeof vi.mocked<T>> {
  ensureCleanupHook(target);

  const source = (isFunction(mock) ? mock(SPY_MARK) : mock) as Partial<Mockable<T>>;
  const entries = Object.keys(source);

  // mock functions based on the provided source
  entries.forEach((key) => {
    const value = source[key as keyof T];
    const currentValue = target[key as keyof T];
    const desc = Object.getOwnPropertyDescriptor(target, key);

    // trying to mock or override something that does not exist on the target
    if (!desc) {
      throw new Error(
        `Cannot mock/override ${description}.${key}. The target property does not exist.`
      );
    }

    const isAccessor = !!desc.get || !!desc.set;
    if (isAccessor) {
      let _value = value;

      if (desc.get) vi.spyOn(target, key as Any, 'get').mockImplementation((): T[Any] => _value);
      if (desc.set) {
        vi.spyOn(target, key as Any, 'set').mockImplementation((newValue) => {
          _value = newValue;
        });
      }

      return;
    }

    if (desc.writable === false || desc.configurable === false) {
      throw new Error(
        `Cannot override ${description}.${key}. The target property is read-only/non-configurable. ` +
          `For ESM modules, pass a copy: { ...actual }`
      );
    }

    // Spy the function without modifying its implementation
    if (value === SPY_MARK) {
      if (isFunction(currentValue)) {
        vi.spyOn(target, key as Any);
        return;
      }

      throw new Error(
        `Cannot spy on property ${key} on target object. ${description}.${key} is not a function`
      );
    }

    // if the parameter is a function, use it as the implementation for the mock
    if (isFunction(value)) {
      vi.spyOn(target, key as Any).mockImplementation(value);
      return;
    }

    // if the target is a function, use the parameter as the return value for the mock
    if (isFunction(currentValue)) {
      vi.spyOn(target, key as Any).mockReturnValue(value);
      return;
    }

    // schedule property restore after each test
    pushRestore(target, key);
    (target as Any)[key] = value;
  });

  return vi.mocked(target);
}

function ensureCleanupHook(target: object) {
  if (HOOKED.has(target)) return;
  HOOKED.add(target);

  afterEach(() => {
    const entries = ((target as Any)[RESTORES] ?? []) as RestoreEntry[];

    // restore in reverse order (more correct if same key overridden multiple times)
    for (let i = entries.length - 1; i >= 0; i--) {
      const { key, hadOwn, desc } = entries[i];

      if (!hadOwn) {
        delete (target as Any)[key];
        continue;
      }

      if (desc) {
        Object.defineProperty(target, key, desc);
      }
    }

    // clear restore stack
    (target as Any)[RESTORES] = [];
  });
}

function pushRestore(target: object, key: string) {
  const hadOwn = Object.prototype.hasOwnProperty.call(target, key);
  const desc = hadOwn ? Object.getOwnPropertyDescriptor(target, key) : undefined;

  const entries = ((target as Any)[RESTORES] ??= []) as RestoreEntry[];
  entries.push({ key, hadOwn, desc });
}

type RestoreEntry = { key: string; hadOwn: boolean; desc?: PropertyDescriptor };

export default setupPartialMock;

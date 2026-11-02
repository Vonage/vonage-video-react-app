import type { Any } from '@common/types';
import { isFunction } from '@common/assertions';
import { vi } from 'vitest';

/**
 * `vi.doMock()` is not hoisted, so it only affects modules imported after it runs. The mock
 * must be registered before importing any consumer of that module.
 *
 * This helper loads the real module first, creates a mutable shallow copy with the requested
 * overrides, registers that copy as the mocked ESM module, and returns the same object so
 * tests can configure or assert against the mocked exports directly.
 *
 * @example
 * const { default: loadConfig } = await doPartialMock(
 *   '../../helpers/config',
 *   () => import('../../helpers/config'),
 *   (actual) => ({
 *     ...actual,
 *     <overrides/spies go here>
 *   })
 * );
 *
 * // Test target module after mocking
 * const { default: authMiddleware } = await import('./authMiddleware');
 */
async function doPartialMock<T extends Record<string, Any>>(
  path: string,
  importer: () => Promise<T>,
  mock?: Partial<T> | ((actual: T) => Partial<T> | Promise<Partial<T>>)
) {
  const actual = await importer();
  const module = {
    ...actual,
    ...(isFunction(mock) ? await mock(actual) : mock),
  };

  vi.doMock(path, () => module);
  return module;
}

export default doPartialMock;

import type { Any } from '@common/types';
import { isFunction } from '@common/assertions';
import { jest } from '@jest/globals';

/**
 * Jest cannot replace ESM dependencies with `jest.mock()` once the module graph
 * has been evaluated. ESM imports are resolved before the test body executes, so the mock
 * must be registered with `jest.unstable_mockModule()` before importing any consumer of
 * that module.
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

  jest.unstable_mockModule(path, () => module);
  return module;
}

export default doPartialMock;

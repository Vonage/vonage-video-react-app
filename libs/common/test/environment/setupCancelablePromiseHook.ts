import type * as LazyModule from 'easy-cancelable-promise';
import { createRequire } from 'node:module';

import tryCatch from '../../src/execution/tryCatch';
import assertNotNil from '../../src/assertions/assertNotNil';

const require = createRequire(import.meta.url);

export type TestProvider = 'auto' | 'vitest' | 'jest';

type MockFunction = {
  (...args: unknown[]): unknown;
  mockClear(): void;
  mockReset(): void;
};

type MockFactory = {
  fn(): MockFunction;
};

// Both Vitest (globals: true) and Jest (injectGlobals) expose their mock
// factory on globalThis. Prefer that: a synchronous require('vitest') fails
// under Vitest's Vite-transformed ESM environment, which is what previously
// made this throw. The require() path stays as a fallback for runners without
// globals enabled.
type GlobalWithMockFactories = typeof globalThis & { vi?: MockFactory; jest?: MockFactory };

function getVitestMockFactory(): MockFactory | undefined {
  const fromGlobal = (globalThis as GlobalWithMockFactories).vi;
  if (fromGlobal) return fromGlobal;

  const { result } = tryCatch(() => require('vitest') as { vi?: MockFactory });
  return result?.vi;
}

function getJestMockFactory(): MockFactory | undefined {
  const fromGlobal = (globalThis as GlobalWithMockFactories).jest;
  if (fromGlobal) return fromGlobal;

  const { result } = tryCatch(() => require('@jest/globals') as { jest?: MockFactory });
  return result?.jest;
}

function getMockFactory(provider: TestProvider): MockFactory {
  if (provider === 'vitest') {
    const factory = getVitestMockFactory();
    assertNotNil(factory, 'Vitest mock factory is not available.');
    return factory;
  }

  if (provider === 'jest') {
    const factory = getJestMockFactory();
    assertNotNil(factory, 'Jest mock factory is not available.');
    return factory;
  }

  const vitest = getVitestMockFactory();
  if (vitest) return vitest;

  const jest = getJestMockFactory();
  if (jest) return jest;

  throw new Error('setupCancelablePromiseHook requires either Vitest or Jest.');
}

function getCancelablePromiseModule(): typeof LazyModule | undefined {
  const { result } = tryCatch(() => require('easy-cancelable-promise') as typeof LazyModule);
  assertNotNil(result);
  return result;
}

export let cancelablePromiseTracker: MockFunction | undefined;

export function setupCancelablePromiseHook(provider: TestProvider = 'auto') {
  const module = getCancelablePromiseModule();

  if (!module) return;

  const mockFactory = getMockFactory(provider);

  cancelablePromiseTracker ??= mockFactory.fn();

  const { CancelablePromise } = module;

  /**
   * Temporary monkey-patch of CancelablePromise to track promises
   * that were canceled during tests.
   */
  CancelablePromise.prototype.cancel = function (this: LazyModule.CancelablePromise<unknown>) {
    cancelablePromiseTracker!(this);

    return this;
  };
}

export default setupCancelablePromiseHook;

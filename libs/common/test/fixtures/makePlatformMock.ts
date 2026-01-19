import { makeGenericMock } from '@common-test/helpers';
import { vi } from 'vitest';
import type { Mockable, SPY_MARK } from '@common/types';
import type * as module from '@common/platform';

type Module = typeof module;

/**
 * Mocks @common/platform with the provided implementations.
 */
const makePlatformMock = async <T extends Mockable<Module>>(
  mock: T | ((spy: typeof SPY_MARK) => T)
) => {
  const module = await vi.importActual<Module>('@common/platform');

  return makeGenericMock({
    description: '@common/platform',

    // modules are read-only, we need to create a copy
    actual: { ...module },

    mock,
  });
};

export default makePlatformMock;

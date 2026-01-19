import type { Mockable, SPY_MARK } from '@common/types';
import type * as module from '@common/platform';
import type { Any } from 'react-hooks-global-states';
import mockModule from '@common-test/helpers/mockModule';

type Module = typeof module;

/**
 * Mocks @common/platform with the provided implementations.
 */
const mockPlatformModule = <T extends Mockable<Module>>(
  actual: Any,
  mock: T | ((spy: typeof SPY_MARK) => T)
): Module => {
  return mockModule<Module>({ ...actual } as Module, mock);
};

export default mockPlatformModule;

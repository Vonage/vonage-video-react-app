import type { Mockable, SPY_MARK } from '@common/types/Mockable';
import { Any } from '@common/types/Any';
// Use a relative path (not the "@web" alias): this file is published, and the
// emitted declaration must resolve for consumers, who have no "@web" alias.
import type * as module from '../../web/platform';
import mockModule from '../../test/helpers/mockModule';

type Module = typeof module;

/**
 * Mocks @web/platform with the provided implementations.
 */
const mockPlatformModule = <T extends Mockable<Module>>(
  actual: Any,
  mock: T | ((spy: typeof SPY_MARK) => T)
): Module => {
  return mockModule<Module>({ ...actual } as Module, mock);
};

export default mockPlatformModule;

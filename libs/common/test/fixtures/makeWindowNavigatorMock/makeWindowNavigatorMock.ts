import { makeGenericMock } from '@common-test/helpers';
import type { Mockable, SPY_MARK } from '@common/types';
import makeMediaDevicesMock from './helpers/makeMediaDevicesMock';
import makePermissionsMock from './helpers/makePermissionsMock';

export type NavigatorMock = Partial<
  Omit<Mockable<Navigator>, 'mediaDevices' | 'permissions'> & {
    mediaDevices?: Mockable<MediaDevices>;
    permissions?: Mockable<Permissions>;
  }
>;

/**
 * Make a mock for the `navigator` object, the mock only contain structure to force developers to explicitly define the properties they want to mock and avoid green by default tests.
 */
const makeWindowNavigatorMock = <T extends NavigatorMock>(
  mock: T | ((spy: typeof SPY_MARK) => T)
) => {
  const { mediaDevices, permissions, ...rest } = mock as NavigatorMock;

  return makeGenericMock<Navigator>('window.navigator', {
    ...rest,
    mediaDevices: makeMediaDevicesMock<MediaDevices>(mediaDevices),
    permissions: makePermissionsMock<Permissions>(permissions),
  } as Navigator);
};

export default makeWindowNavigatorMock;

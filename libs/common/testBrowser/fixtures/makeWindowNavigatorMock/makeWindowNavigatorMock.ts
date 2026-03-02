import { setupPartialMock } from '../../../test/helpers';
import type { Mockable, SPY_MARK } from '@common/types/Mockable';
import makeMediaDevicesMock from './helpers/makeMediaDevicesMock';
import makePermissionsMock from './helpers/makePermissionsMock';

export type NavigatorMock = Partial<
  Omit<Mockable<Navigator>, 'mediaDevices' | 'permissions'> & {
    mediaDevices?: Mockable<MediaDevices>;
    permissions?: Mockable<Permissions>;
    userAgentData?: unknown;
  }
>;

/**
 * Make a mock for the `navigator` object.
 * mediaDevices and permissions by default only contain structure to force developers to explicitly define the properties they want to mock and avoid green by default tests.
 * other properties are mocked by default with the same value as the original one, but can be overridden by providing a different value in the mock object.
 */
const makeWindowNavigatorMock = <T extends NavigatorMock>(
  mock: T | ((spy: typeof SPY_MARK) => T)
) => {
  const { mediaDevices, permissions, ...rest } = mock as NavigatorMock;

  const clone: Navigator = Object.create(Object.getPrototypeOf(window.navigator) as Navigator);

  const descriptors = Object.getOwnPropertyDescriptors(window.navigator);

  // copy based properties and descriptors from the original navigator to the clone
  Object.defineProperties(clone, descriptors);

  // override or make overridable the properties we want to mock
  Object.defineProperties(
    clone,
    Object.getOwnPropertyDescriptors({
      mediaDevices: makeMediaDevicesMock(mediaDevices),
      permissions: makePermissionsMock(permissions),

      // make target properties overridable
      ...Object.keys(rest).reduce(
        (acc, key) => {
          if (!descriptors[key as keyof Navigator]) {
            throw new Error(
              `Cannot mock/override window.navigator.${key}. The target property does not exist.`
            );
          }

          acc[key as keyof Navigator] = clone[key as keyof Navigator];
          return acc;
        },
        {} as Record<string, unknown>
      ),
    })
  );

  return setupPartialMock<Navigator>('window.navigator', clone, {
    ...rest,
  } as Navigator);
};

export default makeWindowNavigatorMock;

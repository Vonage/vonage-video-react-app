import type { Mockable } from '@common/types';
import { setupPartialMock } from '@common-test/helpers';
import { permissionsMock } from '@common-test/mocks';

const makePermissionsMock = <T extends Permissions>(mock?: Mockable<T>): Permissions => {
  return setupPartialMock('navigator.permissions', permissionsMock, mock ?? {});
};

export default makePermissionsMock;

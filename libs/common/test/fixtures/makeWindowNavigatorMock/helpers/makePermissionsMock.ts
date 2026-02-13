import type { Mockable } from '@common/types';
import { setupPartialMock } from '@common-test/helpers';
import { permissionsMock } from '@common-test/mocks';

const makePermissionsMock = (mock?: Mockable<Permissions>): Permissions => {
  return setupPartialMock('navigator.permissions', permissionsMock, mock ?? {});
};

export default makePermissionsMock;

import type { Mockable } from '@common/types/Mockable';
import { setupPartialMock } from '../../../../test/helpers';
import { permissionsMock } from '../../../mocks';

const makePermissionsMock = (mock?: Mockable<Permissions>): Permissions => {
  return setupPartialMock('navigator.permissions', permissionsMock, mock ?? {});
};

export default makePermissionsMock;

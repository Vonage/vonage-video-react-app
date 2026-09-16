import type { Mockable } from '@common/types/Mockable';
import { setupPartialMock } from '../../../../test/helpers';
import { mediaDevicesMock } from '../../../mocks';

const makeMediaDevicesMock = <T extends MediaDevices>(mock?: Mockable<T>): MediaDevices => {
  return setupPartialMock(
    'navigator.mediaDevices',
    mediaDevicesMock,
    (mock ?? {}) as Mockable<MediaDevices>
  );
};

export default makeMediaDevicesMock;

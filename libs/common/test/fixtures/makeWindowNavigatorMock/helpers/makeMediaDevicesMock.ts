import type { Mockable } from '@common/types';
import { setupPartialMock } from '@common-test/helpers';
import { mediaDevicesMock } from '@common-test/mocks';

const makeMediaDevicesMock = <T extends MediaDevices>(mock?: Mockable<T>): MediaDevices => {
  return setupPartialMock(
    'navigator.mediaDevices',
    mediaDevicesMock,
    (mock ?? {}) as Mockable<MediaDevices>
  );
};

export default makeMediaDevicesMock;

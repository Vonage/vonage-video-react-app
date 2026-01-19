import type { Mockable } from '@common/types';
import { makeGenericMock } from '@common-test/helpers';

/**
 * Mocks the specified methods of the `navigator.mediaDevices` object with the provided implementations.
 * Non provider methods will crash if invoked, ensuring that only the intended methods are used in tests.
 */
const setupMediaDevicesMock = <T extends Mockable<MediaDevices>>(mock: T): MediaDevices => {
  const { mediaDevices } = globalThis.navigator;

  return makeGenericMock({
    description: 'navigator.mediaDevices',
    actual: mediaDevices,
    mock,
  });
};

export default setupMediaDevicesMock;

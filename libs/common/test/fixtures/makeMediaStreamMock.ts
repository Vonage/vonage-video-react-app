import type { Mockable } from '@common/types';
import { makeGenericMock } from '@common-test/helpers';
import { type MediaStream, mediaStreamMock } from '@common-test/mocks';

/**
 * Mocks the specified methods of the `navigator.mediaDevices` object with the provided implementations.
 * Non provider methods will crash if invoked, ensuring that only the intended methods are used in tests.
 */
const makeMediaStreamMock = <T extends Mockable<MediaStream>>(mock: T): MediaStream => {
  return makeGenericMock({
    description: 'navigator.mediaDevices.getUserMedia()',
    actual: mediaStreamMock(),
    mock,
  });
};

export default makeMediaStreamMock;

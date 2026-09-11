import type { Mockable } from '@common/types/Mockable';
import { setupPartialMock } from '../../test/helpers';
import { type MediaStream, mediaStreamMock } from '../mocks';

/**
 * Mocks the specified methods of the `navigator.mediaDevices` object with the provided implementations.
 * Non provider methods will crash if invoked, ensuring that only the intended methods are used in tests.
 */
const makeMediaStreamMock = <T extends Mockable<MediaStream>>(mock: T): MediaStream => {
  return setupPartialMock('navigator.mediaDevices.getUserMedia()', mediaStreamMock(), mock);
};

export default makeMediaStreamMock;

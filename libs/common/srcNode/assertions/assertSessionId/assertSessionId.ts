import { assertString } from '@common/assertions';
import { SessionId } from '../../types';
import decodeSessionId from '../../../src/helpers/decodeSessionId';

function assertSessionId(value: unknown): asserts value is SessionId {
  assertString(value, 'SessionId must be a string');
  decodeSessionId({ sessionId: value });
}

export default assertSessionId;

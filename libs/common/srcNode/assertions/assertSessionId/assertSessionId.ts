import { assertString } from '@common/assertions';
import { SessionId } from '../../types';
import decodeSessionId from '../../helpers/decodeSessionId';

function assertSessionId(value: unknown): asserts value is SessionId {
  assertString(value, 'SessionId must be a string');
  decodeSessionId(value);
}

export default assertSessionId;

import { SessionId } from '../../types';
import decodeSessionId from '../../helpers/decodeSessionId';

function assertSessionId(value: unknown): asserts value is SessionId {
  decodeSessionId(value as string);
}

export default assertSessionId;

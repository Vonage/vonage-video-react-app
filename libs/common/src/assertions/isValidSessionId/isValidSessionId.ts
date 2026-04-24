import { tryCatch } from '@common/execution';
import type { SessionId } from '../../types';
import { assertString } from '@common/assertions';
import assertSessionId from '../assertSessionId';

function isValidSessionId(value: unknown): value is SessionId {
  const { error } = tryCatch(() => {
    assertString(value);
    assertSessionId(value);
  });

  return !error;
}

export default isValidSessionId;

import { tryCatch } from '@common/execution';
import { assertString } from '@common/assertions';
import { decodeSessionKey } from '@common/helpers';

function isValidSessionKey(value: unknown): value is string {
  const { error } = tryCatch(() => {
    assertString(value);
    decodeSessionKey({ sessionKey: value });
  });

  return !error;
}

export default isValidSessionKey;

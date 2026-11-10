import { isRecord } from '@common/assertions';
import { tryCatch } from '@common/execution';
import type { VideoClient } from '../video';

function hasVerifiedSessionKey({
  input,
  videoClient,
}: {
  input: unknown;
  videoClient: VideoClient;
}): boolean {
  if (!isRecord(input)) return false;

  const { sessionKey } = input;

  if (typeof sessionKey !== 'string' || sessionKey === '') return false;

  const { error } = tryCatch(() => videoClient.decodeSessionKey({ sessionKey }));

  return !error;
}

export default hasVerifiedSessionKey;

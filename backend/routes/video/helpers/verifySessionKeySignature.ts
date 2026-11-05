import jwt from 'jsonwebtoken';
import { isRecord } from '@common/assertions';
import { tryCatch } from '@common/execution';
import type { VideoClient } from '../video';

type SessionKeySignature =
  | { signature: 'current' }
  | { signature: 'legacy'; claims: Record<string, unknown> }
  | { signature: 'unverifiable' };

function verifySessionKeySignature({
  sessionKey,
  videoClient,
}: {
  sessionKey: string;
  videoClient: VideoClient;
}): SessionKeySignature {
  const { error: currentSignatureError } = tryCatch(() =>
    videoClient.decodeSessionKey({ sessionKey })
  );

  if (!currentSignatureError) return { signature: 'current' };

  const legacySecret = videoClient.auth.applicationId || videoClient.auth.apiKey;
  const { result: legacyClaims } = tryCatch(() => jwt.verify(sessionKey, legacySecret));

  if (!isRecord(legacyClaims)) return { signature: 'unverifiable' };

  return { signature: 'legacy', claims: legacyClaims };
}

export default verifySessionKeySignature;

import jwt from 'jsonwebtoken';
import { SessionKeyClaim } from '@common/constants';
import type { SessionSigning } from '@api-lib/schemas/SessionSigning.schema';
import extensionGrantAudience from './extensionGrantAudience';

const GRANT_LIFETIME_SECONDS = 10 * 60;

/**
 * Signs a short-lived grant that lets other holders of the session's key renew it with the extended minutes.
 * The grant has no sessionId claim, so it can never be decoded as a sessionKey.
 */
function signExtensionGrant({
  sessionSigning,
  sessionId,
  extendedMinutes,
}: {
  sessionSigning: SessionSigning;
  sessionId: string;
  extendedMinutes: number;
}): string {
  return jwt.sign({ [SessionKeyClaim.extended]: extendedMinutes }, sessionSigning.secret, {
    algorithm: sessionSigning.algorithm,
    audience: extensionGrantAudience,
    subject: sessionId,
    expiresIn: GRANT_LIFETIME_SECONDS,
  });
}

export default signExtensionGrant;

import jwt, { type JwtPayload } from 'jsonwebtoken';
import { SessionKeyClaim } from '@common/constants';
import type { SessionSigning } from '@api-lib/schemas/SessionSigning.schema';

/**
 * Re-signs an already verified sessionKey with every claim it carries and the given extended minutes.
 */
function signExtendedSessionKey({
  sessionSigning,
  sessionKey,
  extendedMinutes,
}: {
  sessionSigning: SessionSigning;
  sessionKey: string;
  extendedMinutes: number;
}): string {
  const { iat: _issuedAt, ...claims } = jwt.decode(sessionKey) as JwtPayload;

  return jwt.sign(
    { ...claims, [SessionKeyClaim.extended]: extendedMinutes },
    sessionSigning.secret,
    {
      algorithm: sessionSigning.algorithm,
    }
  );
}

export default signExtendedSessionKey;

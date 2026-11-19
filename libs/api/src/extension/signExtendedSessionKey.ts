import jwt, { type JwtPayload } from 'jsonwebtoken';
import { SessionKeyClaim } from '@common/constants';
import type { ScheduleWindow } from '@common/types';
import type { SessionSigning } from '@api-lib/schemas/SessionSigning.schema';

/**
 * Re-signs an already verified sessionKey with every claim it carries, the extended schedule and the extended minutes.
 */
function signExtendedSessionKey({
  sessionSigning,
  sessionKey,
  schedule,
  extendedMinutes,
}: {
  sessionSigning: SessionSigning;
  sessionKey: string;
  schedule: ScheduleWindow;
  extendedMinutes: number;
}): string {
  const { iat: _issuedAt, ...claims } = jwt.decode(sessionKey) as JwtPayload;

  return jwt.sign(
    {
      ...claims,
      [SessionKeyClaim.schedule]: schedule,
      [SessionKeyClaim.extended]: extendedMinutes,
    },
    sessionSigning.secret,
    {
      algorithm: sessionSigning.algorithm,
    }
  );
}

export default signExtendedSessionKey;

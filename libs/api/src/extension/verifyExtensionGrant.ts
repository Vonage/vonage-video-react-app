import jwt, { type JwtPayload } from 'jsonwebtoken';
import { makeForbiddenErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import type { SessionSigning } from '@api-lib/schemas/SessionSigning.schema';
import { readExtendedClaim } from '@common/helpers';
import extensionGrantAudience from './extensionGrantAudience';

/**
 * Verifies an extension grant issued for the given session and returns the extended minutes it carries.
 */
function verifyExtensionGrant({
  sessionSigning,
  sessionId,
  grant,
}: {
  sessionSigning: SessionSigning;
  sessionId: string;
  grant: string;
}): number {
  const payload = assertResult(
    () =>
      jwt.verify(grant, sessionSigning.secret, {
        audience: extensionGrantAudience,
        subject: sessionId,
      }) as JwtPayload,
    makeForbiddenErrorHandler('The extension grant is invalid, expired or for another session')
  );

  return readExtendedClaim(payload);
}

export default verifyExtensionGrant;

import { makeInternalErrorHandler } from '@api-lib/errors';
import joinExtendedSession from '@api-lib/extension/joinExtendedSession';
import verifyExtensionGrant from '@api-lib/extension/verifyExtensionGrant';
import isScheduleError from '@api-lib/schedule/isScheduleError';
import type { IVideoClient, RenewSessionKeyPayload } from '@api-lib/types';
import { SessionKeyClaim } from '@common/constants';

/**
 * Renews a sessionKey with the extended minutes carried by a grant from extendSession,
 * and returns it with a token that expires at the new end.
 */
function renewSessionKey(this: IVideoClient, payload: RenewSessionKeyPayload) {
  try {
    const { sessionKey, grant } = payload;
    const session = this.decodeSessionKey({ sessionKey });

    const grantedExtendedMinutes = verifyExtensionGrant({
      sessionSigning: this._sessionSigning,
      sessionId: session.sessionId,
      grant,
    });

    const extendedMinutes = Math.max(
      session[SessionKeyClaim.extended] ?? 0,
      grantedExtendedMinutes
    );

    return joinExtendedSession({ videoClient: this, sessionKey, extendedMinutes });
  } catch (error) {
    if (isScheduleError(error)) throw error;

    throw makeInternalErrorHandler('Failed to renew session key')(error);
  }
}

export default renewSessionKey;

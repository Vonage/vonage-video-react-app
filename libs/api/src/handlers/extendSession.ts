import {
  makeBadRequestErrorHandler,
  makeForbiddenErrorHandler,
  makeInternalErrorHandler,
} from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import joinExtendedSession from '@api-lib/extension/joinExtendedSession';
import signExtensionGrant from '@api-lib/extension/signExtensionGrant';
import assertScheduleOpen from '@api-lib/schedule/assertScheduleOpen';
import type { ExtendSessionPayload, IVideoClient } from '@api-lib/types';
import { isNil } from '@common/assertions';
import { MAX_TOTAL_EXTENSION_MINUTES, SessionKeyClaim } from '@common/constants';

/**
 * Extends a running scheduled session by one of the configured options and returns the extended sessionKey,
 * a token that expires at the new end, and a grant that lets other holders of the key renew theirs.
 * Concurrent extensions from the same key keep the longest one instead of adding up.
 */
async function extendSession(this: IVideoClient, payload: ExtendSessionPayload) {
  try {
    const { sessionKey, minutes } = payload;
    const session = this.decodeSessionKey({ sessionKey });
    const schedule = session[SessionKeyClaim.schedule];

    if (isNil(schedule)) {
      throw makeBadRequestErrorHandler('Only scheduled sessions can be extended')(null);
    }

    assertScheduleOpen(schedule);

    const { options } = this._extension;

    if (!options.includes(minutes)) {
      throw makeBadRequestErrorHandler(
        `A session can only be extended by ${options.join(', ')} minutes`
      )(null);
    }

    const requestedExtendedMinutes = (session[SessionKeyClaim.extended] ?? 0) + minutes;

    if (requestedExtendedMinutes > MAX_TOTAL_EXTENSION_MINUTES) {
      throw makeForbiddenErrorHandler(
        `A session cannot be extended by more than ${MAX_TOTAL_EXTENSION_MINUTES} minutes in total`
      )(null);
    }

    const extendedMinutes = await assertResult(
      () =>
        this._extensionStore.commitExtension({
          sessionId: session.sessionId,
          extendedMinutes: requestedExtendedMinutes,
        }),
      makeInternalErrorHandler('Failed to store the session extension')
    );

    const extendedSession = joinExtendedSession({ videoClient: this, sessionKey, extendedMinutes });

    const grant = signExtensionGrant({
      sessionSigning: this._sessionSigning,
      sessionId: session.sessionId,
      extendedMinutes,
    });

    return { ...extendedSession, grant };
  } catch (error) {
    throw makeInternalErrorHandler('Failed to extend session')(error);
  }
}

export default extendSession;

import { makeInternalErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import { type IVideoClient, TokenRole, type JoinSessionPayload } from '@api-lib/types';
import { decodeSessionId } from '@node/helpers';

const threeHoursInMilliseconds = 3 * 60 * 60 * 1000;

function joinSession(this: IVideoClient, payload: JoinSessionPayload) {
  try {
    const { sessionId, clientTokenOptions } = payload;

    const session = assertResult(
      () => decodeSessionId(sessionId),
      makeInternalErrorHandler(`Unable to decode sessionId ${sessionId}`)
    );

    const token = this.createEphemeralToken({
      sessionId,
      clientTokenOptions: {
        role: TokenRole.MODERATOR,
        expireTime: Date.now() + threeHoursInMilliseconds,
        ...clientTokenOptions,
      },
    });

    return {
      ...session,
      token,
    };
  } catch (error) {
    throw makeInternalErrorHandler('Failed to join session')(error);
  }
}

export default joinSession;

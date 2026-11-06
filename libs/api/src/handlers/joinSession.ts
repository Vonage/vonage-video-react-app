import { makeInternalErrorHandler } from '@api-lib/errors';
import { type IVideoClient, type JoinSessionPayload } from '@api-lib/types';

function joinSession(this: IVideoClient, payload: JoinSessionPayload) {
  try {
    const { sessionKey, clientTokenOptions } = payload;
    const session = this.decodeSessionKey({ sessionKey });

    const token = this.createEphemeralToken({
      sessionKey,
      clientTokenOptions,
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

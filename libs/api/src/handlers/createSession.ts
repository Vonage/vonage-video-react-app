import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import type { IVideoClient, CreateSessionPayload } from '@api-lib/types';
import type { SessionKeyPayload } from '@common/types';
import { VideoSessionDetails } from '@common/types';
import { removeUndefinedProps } from '@node/helpers';
import jwt from 'jsonwebtoken';

async function createSession(
  this: IVideoClient,
  payload?: CreateSessionPayload
): Promise<VideoSessionDetails> {
  try {
    const { roomName, sessionOptions } = payload ?? {};

    const session = await assertResult(() => {
      return this.video.createSession(sessionOptions);
    }, makeThirdPartyErrorHandler('Failed to create session'));

    const sessionKeyPayload = removeUndefinedProps({
      sessionId: session.sessionId,
      roomName,
    }) satisfies SessionKeyPayload;

    const sessionKey = jwt.sign(sessionKeyPayload, this._sessionSigning.secret, {
      algorithm: this._sessionSigning.algorithm,
    });

    const sessionMeta = this.decodeSessionId({ sessionId: session.sessionId });

    return { ...session, ...sessionMeta, roomName, sessionKey };
  } catch (error) {
    throw makeInternalErrorHandler('Failed to create session')(error);
  }
}

export default createSession;

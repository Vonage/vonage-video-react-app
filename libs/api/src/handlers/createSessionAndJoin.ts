import { makeInternalErrorHandler } from '@api-lib/errors';
import type { IVideoClient, CreateSessionPayload } from '@api-lib/types';
import { VideoSessionDetailsWithToken } from '@common/types';

async function createSessionAndJoin(
  this: IVideoClient,
  payload?: CreateSessionPayload
): Promise<VideoSessionDetailsWithToken> {
  try {
    const session = await this.createSession.call(this, payload);
    const { token } = this.joinSession.call(this, { sessionKey: session.sessionKey });

    return { ...session, token };
  } catch (error) {
    throw makeInternalErrorHandler('Failed to create session and join')(error);
  }
}

export default createSessionAndJoin;

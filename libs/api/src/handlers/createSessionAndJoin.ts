import { makeInternalErrorHandler } from '@api-lib/errors';
import type { IVideoClient, CreateSessionAndJoinPayload } from '@api-lib/types';
import { VideoSessionDetailsWithToken } from '@common/types';

async function createSessionAndJoin(
  this: IVideoClient,
  payload?: CreateSessionAndJoinPayload
): Promise<VideoSessionDetailsWithToken> {
  try {
    const session = await this.createSession(payload);
    const { token } = this.joinSession({
      sessionKey: session.sessionKey,
      clientTokenOptions: payload?.clientTokenOptions,
    });

    return { ...session, token };
  } catch (error) {
    throw makeInternalErrorHandler('Failed to create session and join')(error);
  }
}

export default createSessionAndJoin;

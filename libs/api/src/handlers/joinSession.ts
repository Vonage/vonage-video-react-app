import { makeInternalErrorHandler } from '@api-lib/errors';
import type { JoinSessionPayload } from '@api-lib/schemas/JoinSessionPayload.schema';
import { type IVideoOrchestrator, TokenRole } from '@api-lib/types';
import ensureSession from './ensureSession';

const threeHoursInMilliseconds = 3 * 60 * 60 * 1000;

async function joinSession(this: IVideoOrchestrator, payload: JoinSessionPayload) {
  try {
    const { sessionId, clientTokenOptions } = payload;

    const session = await ensureSession.call(this, {
      sessionId,
    });

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

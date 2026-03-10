import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import type { IVideoOrchestrator, CreateSessionPayload } from '@api-lib/types';
import { decodeSessionId } from '@node/helpers';
import { MediaMode } from '@vonage/video';

async function createSession(this: IVideoOrchestrator, payload?: CreateSessionPayload) {
  try {
    const { sessionOptions } = payload ?? {};

    const { sessionId } = await assertResult(() => {
      return this.video$.createSession({
        mediaMode: MediaMode.ROUTED,
        ...sessionOptions,
      });
    }, makeThirdPartyErrorHandler('Failed to create session'));

    const session = decodeSessionId(sessionId);

    return { ...session, sessionId };
  } catch (error) {
    throw makeInternalErrorHandler('Failed to create session')(error);
  }
}

export default createSession;

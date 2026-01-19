import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import type { IVideoOrchestrator, EnsureSessionPayload } from '@api-lib/types';
import { isNotNil } from '@common/assertions';
import { decodeSessionId } from '@node/helpers';
import { SessionIdSchema } from '@node/schemas';
import { MediaMode } from '@vonage/video';

async function ensureSession(this: IVideoOrchestrator, payload?: EnsureSessionPayload) {
  try {
    const sessionId = await (async () => {
      if (isNotNil(payload?.sessionId)) {
        return payload.sessionId;
      }

      const { sessionOptions } = payload ?? {};

      const session = await assertResult(() => {
        return this.video$.createSession({
          mediaMode: MediaMode.ROUTED,
          ...sessionOptions,
        });
      }, makeThirdPartyErrorHandler('Failed to create session'));

      return SessionIdSchema.parse(session.sessionId);
    })();

    const { partnerId, ...session } = decodeSessionId(sessionId);

    return { ...session, sessionId, applicationId: partnerId };
  } catch (error) {
    throw makeInternalErrorHandler('Failed to ensure session')(error);
  }
}

export default ensureSession;

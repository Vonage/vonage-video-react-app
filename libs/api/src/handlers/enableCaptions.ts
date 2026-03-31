import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import type { EnableCaptionsPayload } from '@api-lib/schemas';
import type { IVideoClient } from '@api-lib/types';
import { isErrorLike } from '@common/assertions';
import { tryCatch } from '@common/execution';

async function enableCaptions(this: IVideoClient, payload: EnableCaptionsPayload): Promise<void> {
  try {
    const { sessionId, captionOptions } = payload;

    const clientToken = this.createEphemeralToken({ sessionId });

    const { error } = await tryCatch(() =>
      this._video.enableCaptions(sessionId, clientToken, captionOptions)
    );

    if (error && isErrorLike(error)) {
      const isLiveCaptionsAlreadyStarted = error.message
        .toLowerCase()
        .includes('live captions have already started for this session');

      // If live captions have already been started for the session, we can consider the action successful
      if (isLiveCaptionsAlreadyStarted) return;

      throw makeThirdPartyErrorHandler(error.message)(error);
    }

    if (!error) return;

    throw makeThirdPartyErrorHandler('Failed to enable captions')(error);
  } catch (error) {
    throw makeInternalErrorHandler('Failed to enable captions')(error);
  }
}

export default enableCaptions;

import {
  isHttpErrorLike,
  makeInternalErrorHandler,
  makeThirdPartyErrorHandler,
} from '@api-lib/errors';
import type { EnableCaptionsPayload } from '@api-lib/schemas';
import type { IVideoClient } from '@api-lib/types';
import { isErrorLike } from '@common/assertions';
import { tryCatch } from '@common/execution';

type EnableCaptionResponse = {
  captionsId: string | null;
};

/**
 * Make sure captions are enable for a given session.
 */
async function ensureCaptionsEnabled(
  this: IVideoClient,
  payload: EnableCaptionsPayload
): Promise<EnableCaptionResponse> {
  try {
    const { sessionKey, captionOptions } = payload;
    const { sessionId } = this.decodeSessionKey({ sessionKey });

    const clientToken = this.createEphemeralToken({ sessionKey });

    const { error, result } = await tryCatch(() =>
      this.video.enableCaptions(sessionId, clientToken, captionOptions)
    );

    if (error && isErrorLike(error)) {
      const isLiveCaptionsAlreadyStarted = error.message
        .toLowerCase()
        .includes('live captions have already started for this session');

      // If live captions have already been started for the session, we can consider the action successful
      if (isLiveCaptionsAlreadyStarted) return { captionsId: null };

      const isCaptionsAlreadyEnabled = isHttpErrorLike(error) && error.response.status === 409;
      if (isCaptionsAlreadyEnabled) return { captionsId: null };

      throw makeThirdPartyErrorHandler(error.message)(error);
    }

    if (!error) return { captionsId: result?.captionsId ?? null };

    throw makeThirdPartyErrorHandler('Failed to enable captions')(error);
  } catch (error) {
    throw makeInternalErrorHandler('Failed to enable captions')(error);
  }
}

export default ensureCaptionsEnabled;

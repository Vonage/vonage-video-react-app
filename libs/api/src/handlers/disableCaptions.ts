import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import type { DisableCaptionsPayload } from '@api-lib/schemas';
import type { IVideoClient } from '@api-lib/types';
import { isErrorLike } from '@common/assertions';
import { tryCatch } from '@common/execution';

async function disableCaptions(this: IVideoClient, payload: DisableCaptionsPayload): Promise<void> {
  try {
    const { captionsId } = payload;

    const { error } = await tryCatch(() => this.video.disableCaptions(captionsId));

    if (error && isErrorLike(error)) {
      const isCaptionsNotFound = error.message.toLowerCase().includes('caption not found');

      // If captions are not found for the session, we can consider the action successful
      if (isCaptionsNotFound) return;

      throw makeThirdPartyErrorHandler(error.message)(error);
    }

    if (!error) return;

    throw makeThirdPartyErrorHandler('Failed to disable captions')(error);
  } catch (error) {
    throw makeInternalErrorHandler('Failed to disable captions')(error);
  }
}

export default disableCaptions;

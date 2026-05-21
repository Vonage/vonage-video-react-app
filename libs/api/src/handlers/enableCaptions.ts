import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import type { EnableCaptionsPayload } from '@api-lib/schemas';
import type { IVideoClient } from '@api-lib/types';
import { assertResult } from '@common/execution';
import type { EnableCaptionResponse } from '@vonage/video';

async function enableCaptions(
  this: IVideoClient,
  payload: EnableCaptionsPayload
): Promise<EnableCaptionResponse> {
  try {
    const { sessionKey, captionOptions } = payload;
    const { sessionId } = this.decodeSessionKey({ sessionKey });

    const clientToken = this.createEphemeralToken({ sessionKey });

    const captionsResponse = await assertResult(
      () => this.video.enableCaptions(sessionId, clientToken, captionOptions),
      makeThirdPartyErrorHandler('Failed to enable captions')
    );

    return captionsResponse;
  } catch (error) {
    throw makeInternalErrorHandler('Failed to enable captions')(error);
  }
}

export default enableCaptions;

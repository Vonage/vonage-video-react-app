import { VideoAction } from '@api-lib';
import getSessionStorageService from '../../sessionStorageService';
import { makeInternalErrorHandler } from '@api-lib/errors';
import { videoHandler } from './video';
import { isNil } from '@node/assertions';

const sessionService = getSessionStorageService();

/**
 * TODO: An easier approach will be only use ensureCaptions in the client and only clean captions when the session is closed
 */
videoHandler.override$(VideoAction.enableCaptions, async (opts) => {
  try {
    const { assertInput, videoClient } = opts;
    const { sessionKey } = assertInput(opts.input);

    const savedCaptionsId = await sessionService.getCaptionsId({ sessionKey });

    const { captionsId } = await (async () => {
      const result = await videoClient.ensureCaptionsEnabled({
        sessionKey,
      });

      // If captions were already enable returns the saved captionsId, otherwise returns the new captionsId
      const captionsId = result.captionsId ?? savedCaptionsId;

      if (isNil(captionsId)) {
        throw makeInternalErrorHandler('Unable to retrieve captionsId')(null);
      }

      return { captionsId };
    })();

    await sessionService.incrementCaptionsUserCount({
      sessionKey,
    });

    return captionsId;
  } catch (error: unknown) {
    throw makeInternalErrorHandler('Failed to enable captions')(error);
  }
});

videoHandler.override$(VideoAction.disableCaptions, async (opts) => {
  try {
    const { assertInput, videoClient } = opts;
    const { captionsId, sessionKey } = assertInput(opts.input);

    const count = await sessionService.decrementCaptionsUserCount({ sessionKey });
    const hasOtherUsers = count > 0;

    if (hasOtherUsers) return;

    await videoClient.disableCaptions({ sessionKey, captionsId });
  } catch (error: unknown) {
    throw makeInternalErrorHandler('Failed to enable captions')(error);
  }
});

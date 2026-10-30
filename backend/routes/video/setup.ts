import getSessionStorageService from '../../sessionStorageService';
import { makeInternalErrorHandler } from '@api-lib/errors';
import { videoHandler } from './video';
import { createRtcStatsUrl, getOrCreateSessionKeyFromRoomName } from '../../helpers';

const sessionService = getSessionStorageService();

// #region Legacy endpoints for android and old links with roomName.

/**
 * [TODO] This is a temporary solution to support legacy vera functionality without depending on the old routers
 * This override checks if a session already exists for the given roomName and reuses it.
 */
videoHandler.override$('createSession', async (opts) => {
  try {
    const { assertInput, videoClient } = opts;

    const input = assertInput(opts.input);
    const { roomName } = input ?? {};

    if (!roomName) return videoClient.createSession(input);

    const sessionKey = await getOrCreateSessionKeyFromRoomName({ videoClient, roomName });
    const sessionDetails = videoClient.decodeSessionKey({ sessionKey });

    return { ...sessionDetails, roomName };
  } catch (error) {
    throw makeInternalErrorHandler('Failed to create session')(error);
  }
});

/**
 * TODO: An easier approach will be only use ensureCaptions in the client and only clean captions when the session is closed
 */
videoHandler.override$('enableCaptions', async (opts) => {
  try {
    const { assertInput, videoClient } = opts;
    const { sessionKey } = assertInput(opts.input);
    const { sessionId } = videoClient.decodeSessionKey({ sessionKey });

    const savedCaptionsId = await sessionService.getCaptionsId({ sessionId });

    const { captionsId } = await (async () => {
      const result = await videoClient.ensureCaptionsEnabled({
        sessionKey,
      });

      // If captions were already enable returns the saved captionsId, otherwise returns the new captionsId
      const captionsId = result.captionsId ?? savedCaptionsId;

      // [TODO]: This is why we cannot relay on our state to know if captions are enable or not.
      // if (isNil(captionsId)) {
      //   throw makeInternalErrorHandler('Unable to retrieve captionsId')(null);
      // }

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

videoHandler.override$('disableCaptions', async (opts) => {
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

// #endregion Legacy endpoints for android and old links with roomName.

/**
 * Optional rtcstats integration (https://rtcstats.com), off unless RTCSTATS_ENDPOINT and
 * RTCSTATS_JWT_SECRET are set. Runs after the Vonage token is minted, so it never changes how that
 * token is created, and adds the signed rtcstats-server URL to the joinSession result. The claims
 * come from the decoded session, never from client input. The frontend passes the URL to
 * rtcStatsTrace.connect when ENABLE_RTCSTATS is on.
 */
videoHandler.onSettled$('joinSession', ({ error, result }) => {
  if (error || !result) return;

  const rtcStatsUrl = createRtcStatsUrl(result);

  if (!rtcStatsUrl) return;

  Object.assign(result, { rtcStatsUrl });
});

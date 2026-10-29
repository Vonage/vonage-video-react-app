import getSessionStorageService from '../../sessionStorageService';
import { makeInternalErrorHandler, makeUnauthorizedErrorHandler } from '@api-lib/errors';
import { videoHandler } from './video';
import { getOrCreateSessionKeyFromRoomName, getSessionKeyFromRoomName } from '../../helpers';
import { VideoAction } from '@api-lib';
import loadConfig from '../../helpers/config';
import hasVerifiedSessionKey from './helpers/hasVerifiedSessionKey';

const sessionService = getSessionStorageService();

// #region Legacy endpoints for android and old links with roomName.

/**
 * [TODO] This is a temporary solution to support legacy vera functionality without depending on the old routers
 * This override checks if a session already exists for the given roomName and reuses it.
 */
/**
 * An action is self-authorized when it carries a sessionKey, because the key is signed and is
 * verified here before the handler runs. Anything else must prove an identity, so an action added
 * later is closed by default. createSession is exempt: it is the entry point that decides below.
 */
videoHandler.use$((opts) => {
  const { videoAction, ctx, input, next } = opts;

  if (videoAction === VideoAction.createSession) return next();
  if (!loadConfig().authEnabled) return next();
  if (ctx.user) return next();
  if (hasVerifiedSessionKey({ input, videoClient: ctx.videoClient })) return next();

  throw makeUnauthorizedErrorHandler(
    `${videoAction} requires a signed-in user or a valid sessionKey`
  )(null);
});

videoHandler.override$('createSession', async (opts) => {
  try {
    const { assertInput, videoClient, ctx, input: rawInput } = opts;

    const input = assertInput(opts.input);
    const { roomName } = input ?? {};
    const { authEnabled, legacyRoomNameLinksEnabled } = loadConfig();
    const mayCreate =
      !authEnabled || Boolean(ctx.user) || hasVerifiedSessionKey({ input: rawInput, videoClient });

    if (!roomName) {
      if (!mayCreate) {
        throw makeUnauthorizedErrorHandler('Creating a session requires a signed-in user')(null);
      }

      return videoClient.createSession(input);
    }

    const sessionKey = await (async () => {
      if (mayCreate) return getOrCreateSessionKeyFromRoomName({ videoClient, roomName });

      if (!legacyRoomNameLinksEnabled) {
        throw makeUnauthorizedErrorHandler('Joining a room by name is disabled')(null);
      }

      return getSessionKeyFromRoomName({ roomName });
    })();

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

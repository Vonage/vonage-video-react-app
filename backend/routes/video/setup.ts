import getSessionStorageService from '../../sessionStorageService';
import { makeInternalErrorHandler, makeUnauthorizedErrorHandler } from '@api-lib/errors';
import { videoHandler } from './video';
import { getOrCreateSessionKeyFromRoomName } from '../../helpers';
import { VideoAction } from '@api-lib';
import { assertResult } from '@api-lib/executions';
import loadConfig from '../../helpers/config';
import hasVerifiedSessionKey from './helpers/hasVerifiedSessionKey';
import assertAnonymousSessionCreationLimit from './helpers/assertAnonymousSessionCreationLimit';
import verifySessionKeySignature from './helpers/verifySessionKeySignature';
import resignSessionKey from './helpers/resignSessionKey';
import { isRecord } from '@common/assertions';

const sessionService = getSessionStorageService();

/**
 * Without a signed-in user, an action passes only when its input carries a sessionKey whose
 * signature verifies. Other IDs in the input, such as archiveId or captionsId, are not checked
 * against that key's session. createSession is exempt: its override below decides access.
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

videoHandler.use$((opts) => {
  const { ctx, input, next } = opts;
  const config = loadConfig();
  const isLegacySessionKeyAllowed =
    config.legacySessionKeysEnabled && (!config.authEnabled || Boolean(ctx.user));

  if (!isLegacySessionKeyAllowed) return next();
  if (!isRecord(input) || typeof input.sessionKey !== 'string') return next();

  const sessionKeySignature = verifySessionKeySignature({
    sessionKey: input.sessionKey,
    videoClient: ctx.videoClient,
  });

  if (sessionKeySignature.signature !== 'legacy') return next();

  const sessionKey = resignSessionKey({
    claims: sessionKeySignature.claims,
    videoClient: ctx.videoClient,
  });

  return next({ input: { ...input, sessionKey } });
});

videoHandler.use$('createSessionAndJoin', async ({ ctx, next }) => {
  const isAnonymousCaller = loadConfig().authEnabled && !ctx.user;

  if (!isAnonymousCaller) return next();

  await assertAnonymousSessionCreationLimit({ ipAddress: ctx.ipAddress });

  return next();
});

videoHandler.override$('createSession', async (opts) => {
  try {
    const { assertInput, videoClient, ctx } = opts;

    const input = assertInput(opts.input);
    const { roomName } = input ?? {};
    const hasAccess = !loadConfig().authEnabled || Boolean(ctx.user);

    if (!hasAccess) {
      throw makeUnauthorizedErrorHandler('Creating or joining a room requires a signed-in user')(
        null
      );
    }

    if (!roomName) return videoClient.createSession(input);

    const sessionKey = await assertResult(
      () => getOrCreateSessionKeyFromRoomName({ videoClient, roomName }),
      makeInternalErrorHandler('Failed to get or create the session for the room name')
    );

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

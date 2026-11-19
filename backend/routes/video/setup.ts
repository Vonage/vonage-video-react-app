import getSessionStorageService from '../../sessionStorageService';
import { makeInternalErrorHandler, makeUnauthorizedErrorHandler } from '@api-lib/errors';
import { videoHandler } from './video';
import { getOrCreateSessionKeyFromRoomName } from '../../helpers';
import { VideoAction } from '@api-lib';
import { assertResult } from '@api-lib/executions';
import { runExpressMiddleware } from '@api-lib/routing';
import hasVerifiedSessionKey from './helpers/hasVerifiedSessionKey';
import isAnonymousCaller from './helpers/isAnonymousCaller';
import anonymousSessionCreationLimiter from '../../middleware/anonymousSessionCreationLimiter';
import verifySessionKeySignature from './helpers/verifySessionKeySignature';
import resignSessionKey from './helpers/resignSessionKey';
import isLegacySessionKeyAllowed from './helpers/isLegacySessionKeyAllowed';
import { isNotNil, isRecord } from '@common/assertions';

const sessionService = getSessionStorageService();

/** Only the sessionKey is checked: other IDs in the input (archiveId, captionsId) are not matched to its meeting. */
videoHandler.use$(function requireSignedInUserOrVerifiedSessionKey(opts) {
  const { videoAction, ctx, input, next } = opts;

  if (videoAction === VideoAction.createSession) return next();
  if (!isAnonymousCaller(ctx)) return next();
  if (hasVerifiedSessionKey({ input, videoClient: ctx.videoClient })) return next();

  throw makeUnauthorizedErrorHandler(
    `${videoAction} requires a signed-in user or a valid sessionKey`
  )(null);
});

videoHandler.use$(function resignAllowedLegacySessionKey(opts) {
  const { ctx, input, next } = opts;

  if (!isLegacySessionKeyAllowed({ user: ctx.req.user })) return next();
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

videoHandler.use$(
  VideoAction.createSessionAndJoin,
  async function limitAnonymousSessionCreation({ ctx, next }) {
    if (!isAnonymousCaller(ctx)) return next();

    await runExpressMiddleware({
      middleware: anonymousSessionCreationLimiter,
      req: ctx.req,
      res: ctx.res,
    });

    return next();
  }
);

videoHandler.override$('createSession', async (opts) => {
  try {
    const { assertInput, videoClient, ctx } = opts;

    const input = assertInput(opts.input);
    const { roomName, schedule } = input ?? {};
    const isScheduledMeeting = isNotNil(schedule);
    const hasAccess = !isAnonymousCaller(ctx);

    if (!hasAccess) {
      throw makeUnauthorizedErrorHandler('Creating or joining a room requires a signed-in user')(
        null
      );
    }

    if (!roomName || isScheduledMeeting) return videoClient.createSession(input);

    const sessionKey = await assertResult(
      () => getOrCreateSessionKeyFromRoomName({ videoClient, roomName, user: ctx.req.user }),
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

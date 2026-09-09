import { Router } from 'express';
import { createVideoHandler, VideoAction } from '@api-lib';
import { createSession, startArchive, enableCaptions, joinSession } from './constants';
import { httpHandler } from '@node/routing';
import type { Request, Response } from 'express';
import { makeBadRequestErrorHandler, makeInternalErrorHandler } from '@api-lib/errors';
import SessionHookPayloadSchema from './schemas/SessionHookPayload.schema';
import CaptionsHookPayloadSchema from './schemas/CaptionsHookPayload.schema';
import ArchiveHookPayloadSchema from './schemas/ArchiveHookPayload.schema';
import { VideoSessionDetails } from '@common/types';
import { assertResult } from '@api-lib/executions';
import getSessionStorageService from '../../sessionStorageService';
import getRequiredEnv from '../../helpers/getRequiredEnv';
import { CaptionsStatus } from './types';

const videoRouter = Router();

const sessionService = getSessionStorageService();

export const videoHandler = createVideoHandler({
  auth: {
    authType: 'jwt',
    applicationId: getRequiredEnv('VONAGE_APP_ID'),
    privateKey: getRequiredEnv('VONAGE_PRIVATE_KEY'),
  },
  videoParams: {
    videoHost: process.env.VONAGE_VIDEO_HOST,
  },

  /**
   * Adds the default values for the different video methods.
   *
   * @example
   * createSession:
   * - mediaMode: 'routed'
   *
   * startArchive:
   * - resolution: '1280x720'
   * - layout: { type: 'bestFit' }
   *
   * enableCaptions:
   * - languageCode: 'en-US'
   */
  handlersConfig: {
    createSession,
    joinSession,
    startArchive,
    enableCaptions,
  },
});

export const { makeVideoClient$ } = videoHandler.router$;

/**
 * Middleware for storing the sessionKey per SessionId and roomName.
 */
videoHandler.onSettled$(async ({ videoAction, error, result }) => {
  const isCreatingOrJoiningSession =
    !error &&
    [VideoAction.createSession, VideoAction.createSessionAndJoin, VideoAction.joinSession].includes(
      videoAction
    );

  if (!isCreatingOrJoiningSession) return;

  const { sessionId, sessionKey, roomName } = result as VideoSessionDetails;

  await sessionService.setSession({ sessionId, sessionKey, roomName: roomName! });
});

/**
 * Listen to captions enabled/disabled events
 */
videoRouter.post(
  '/hooks/captions',
  httpHandler(async (req: Request, res: Response) => {
    const { sessionId, captionId, status } = assertResult(
      () => CaptionsHookPayloadSchema.parse(req.body),
      makeBadRequestErrorHandler('Invalid captions hook payload')
    );

    const terminalStatuses: CaptionsStatus[] = ['started', 'stopped', 'failed'];
    const shouldProcessCaptionsEvent = terminalStatuses.includes(status);

    if (!shouldProcessCaptionsEvent) return res.status(200).send();

    await assertResult(
      () =>
        sessionService.setCaptionsId({
          sessionId,
          captionsId: status === 'started' ? captionId : null,
        }),
      makeInternalErrorHandler('Failed to process captions event')
    );

    return res.status(200).send();
  })
);

/**
 * Listen to archive started/stopped events
 */
videoRouter.post(
  '/hooks/archive',
  httpHandler(async (req: Request, res: Response) => {
    const {
      sessionId,
      id: archiveId,
      status,
    } = assertResult(
      () => ArchiveHookPayloadSchema.parse(req.body),
      makeBadRequestErrorHandler('Invalid archive hook payload')
    );

    const shouldProcessArchiveEvent = status === 'started' || status === 'stopped';

    if (!shouldProcessArchiveEvent) return res.status(200).send();

    await assertResult(async () => {
      const existingArchiveIds = await sessionService.getArchiveIds({ sessionId });

      if (status === 'started') {
        const archiveIds = [...new Set([...existingArchiveIds, archiveId])];

        return sessionService.setArchiveIds({
          sessionId,
          archiveIds,
        });
      }

      const archiveIds = existingArchiveIds.filter((id) => id !== archiveId);

      return sessionService.setArchiveIds({ sessionId, archiveIds });
    }, makeInternalErrorHandler('Failed to process archive event'));

    return res.status(200).send();
  })
);

/**
 * Listen to session destroyed events to cleanup our state and stop any active archives or captions related to the session.
 * This hook is essential to avoid unnecessary costs and to clean up our state when sessions are destroyed.
 */
videoRouter.post(
  '/hooks/session',
  httpHandler(async (req: Request, res: Response) => {
    const { sessionId, event } = assertResult(
      () => SessionHookPayloadSchema.parse(req.body),
      makeBadRequestErrorHandler('Invalid session hook payload')
    );

    const shouldProcessSessionEvent = event === 'sessionDestroyed';

    if (!shouldProcessSessionEvent) return res.status(200).send();

    await assertResult(async () => {
      const captionsId = await sessionService.getCaptionsId({ sessionId });
      const archiveIds = await sessionService.getArchiveIds({ sessionId });

      const videoClient = makeVideoClient$();

      await Promise.allSettled([
        captionsId ? videoClient.video.disableCaptions(captionsId) : Promise.resolve(),

        // stop all the archives related to the session.
        ...archiveIds.map((archiveId) => videoClient.video.stopArchive(archiveId)),
      ]);

      // cleanup session data
      await sessionService.setCaptionsId({ sessionId, captionsId: null });

      return sessionService.setArchiveIds({ sessionId, archiveIds: [] });
    }, makeInternalErrorHandler('Failed to process session event'));

    return res.status(200).send();
  })
);

// #endregion ------------------------------------------------------------------------

videoRouter.use(videoHandler);

export type VideoClient = ReturnType<typeof makeVideoClient$>;

export default videoRouter;

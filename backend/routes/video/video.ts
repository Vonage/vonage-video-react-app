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
import { restartArchivingAfterServerRotation } from './helpers';
import getSessionStorageService from '../../sessionStorageService';
import { CaptionsStatus } from './types';

const videoRouter = Router();

const sessionService = getSessionStorageService();

export const videoHandler = createVideoHandler({
  auth: {
    authType: 'jwt',
    applicationId: process.env.VONAGE_APP_ID!,
    privateKey: process.env.VONAGE_PRIVATE_KEY!,
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

const videoClient = makeVideoClient$();

/**
 * Middleware to inject archiveId when not provided in stopArchive calls.
 * This handles server rotation scenarios where the frontend has a stale archiveId.
 */
videoHandler.use$('stopArchive', async ({ input, next }) => {
  let { archiveId } = input as { sessionKey: string; archiveId?: string };
  const { sessionKey } = input as { sessionKey: string };

  // If archiveId is not provided, retrieve it from storage
  if (!archiveId && sessionKey) {
    const { decodeSessionKey } = await import('@common/helpers');
    const { sessionId } = decodeSessionKey({ sessionKey });

    const archiveIds = await sessionService.getArchiveIds({ sessionId });

    if (archiveIds.length > 0) {
      archiveId = archiveIds[0];
      // Inject the archiveId into the input
      (input as { archiveId: string }).archiveId = archiveId;
    }
  }

  return next();
});

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
 * Middleware for storing archiveId immediately after starting archive.
 * This ensures stopArchive middleware can find it without waiting for webhook.
 */
videoHandler.onSettled$(async ({ videoAction, error, result }) => {
  if (error) return;
  if (videoAction !== VideoAction.startArchive) return;

  const archive = result as { id: string; sessionId: string };
  const existingArchiveIds = await sessionService.getArchiveIds({ sessionId: archive.sessionId });
  const archiveIds = [...new Set([...existingArchiveIds, archive.id])];

  await sessionService.setArchiveIds({
    sessionId: archive.sessionId,
    archiveIds,
  });
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
 * Listen to archive started/stopped events.
 * When an archive stops due to server rotation (session migration), the backend
 * automatically restarts it so recording continues without user intervention.
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

      await sessionService.setArchiveIds({ sessionId, archiveIds });

      await restartArchivingAfterServerRotation({
        sessionId,
        sessionService,
        videoClient,
      });
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
    const { sessionId, event, reason } = assertResult(
      () => SessionHookPayloadSchema.parse(req.body),
      makeBadRequestErrorHandler('Invalid session hook payload')
    );

    const shouldProcessSessionEvent = event === 'sessionDestroyed';

    if (!shouldProcessSessionEvent) return res.status(200).send();

    const isServerRotation = reason === 'serverRotation';

    if (isServerRotation) {
      // Mark this session as pending migration restart so the next archive stopped
      // event knows to restart archiving automatically.
      await sessionService.setServerRotationPending({ sessionId, pending: true });
    }

    const captionsId = await sessionService.getCaptionsId({ sessionId });
    const archiveIds = await sessionService.getArchiveIds({ sessionId });

    // On a server rotation the archives must be left alone: Vonage stops them itself and we
    // want them to restart. For any other reason all pending archives are stopped.
    const pendingArchiveStops = (() => {
      if (isServerRotation) return [];

      return archiveIds.map((archiveId) => videoClient.video.stopArchive(archiveId));
    })();

    await Promise.allSettled([
      captionsId ? videoClient.video.disableCaptions(captionsId) : Promise.resolve(),
      ...pendingArchiveStops,
    ]);

    if (!isServerRotation) {
      await sessionService.setCaptionsId({ sessionId, captionsId: null });
      await sessionService.setArchiveIds({ sessionId, archiveIds: [] });
    }

    return res.status(200).send();
  })
);

// #endregion ------------------------------------------------------------------------

videoRouter.use(videoHandler);

export type VideoClient = ReturnType<typeof makeVideoClient$>;

export default videoRouter;

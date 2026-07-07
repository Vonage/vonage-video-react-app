import { Request, Response, Router } from 'express';
import getSessionStorageService from '../sessionStorageService';
import { makeVideoClient$ } from './video';
import { makeInternalErrorHandler } from '@api-lib/errors';
import { getSessionKeyFromRoomName, getOrCreateSessionKeyFromRoomName } from '../helpers';
import tryCatch from '@common/execution/tryCatch';

const sessionRouter = Router();
const sessionService = getSessionStorageService();

const videoClient = makeVideoClient$();

sessionRouter.get('/:room', async (req: Request<{ room: string }>, res: Response) => {
  try {
    const { room: roomName } = req.params;
    const sessionKey = await getOrCreateSessionKeyFromRoomName({ videoClient, roomName });

    const { token } = videoClient.joinSession({
      sessionKey,
    });

    const session = videoClient.decodeSessionKey({ sessionKey });
    const captionsId = await sessionService.getCaptionsId({ sessionId: session.sessionId });

    res.json({
      ...session,
      token,
      apiKey: session.applicationId,
      captionsId,
      roomName,
    });
  } catch (error) {
    const applicationError = parseError('Failed to get or create session', error);

    res.status(applicationError.statusCode).json(applicationError);
  }
});

sessionRouter.post('/:room/startArchive', async (req: Request<{ room: string }>, res: Response) => {
  try {
    const { room: roomName } = req.params;
    const sessionKey = await getSessionKeyFromRoomName({ roomName });

    const archiveResponse = await videoClient.startArchive({
      sessionKey,
    });

    res.json({
      archiveId: archiveResponse.id,
      ...archiveResponse,
    });
  } catch (error: unknown) {
    const applicationError = parseError('Failed to start archive', error);

    res.status(applicationError.statusCode).json(applicationError);
  }
});

sessionRouter.post(
  '/:room/:archiveId/stopArchive',
  async (req: Request<{ room: string; archiveId: string }>, res: Response) => {
    try {
      const { archiveId, room: roomName } = req.params;
      const sessionKey = await getSessionKeyFromRoomName({ roomName });

      const archiveResponse = await videoClient.stopArchive({ sessionKey, archiveId });

      res.json({
        ...archiveResponse,
        archiveId: archiveResponse.id,
        status: 200,
      });
    } catch (error: unknown) {
      const applicationError = parseError('Failed to stop archive', error);

      res.status(applicationError.statusCode).json(applicationError);
    }
  }
);

sessionRouter.get('/:room/archives', async (req: Request<{ room: string }>, res: Response) => {
  try {
    const { room: roomName } = req.params;
    const sessionKey = await getSessionKeyFromRoomName({ roomName });

    const response = await videoClient.searchArchives({ sessionKey });

    res.json({
      ...response,
      archives: response.items,
      status: 200,
    });
  } catch (error: unknown) {
    const applicationError = parseError('Failed to search archives', error);

    res.status(applicationError.statusCode).json(applicationError);
  }
});

sessionRouter.post(
  '/:room/enableCaptions',
  async (req: Request<{ room: string }>, res: Response) => {
    try {
      const { room: roomName } = req.params;
      const sessionKey = await getSessionKeyFromRoomName({ roomName });
      const { sessionId } = videoClient.decodeSessionKey({ sessionKey });

      const newCaptionCount = await sessionService.incrementCaptionsUserCount({ sessionKey });

      if (newCaptionCount === 1) {
        const { result: captionsId, error } = await tryCatch(async () => {
          const { captionsId } = await videoClient.enableCaptions({ sessionKey });
          await sessionService.setCaptionsId({ sessionId, captionsId });
          return captionsId;
        });

        if (error) {
          // Roll back the increment so a transient failure can't wedge captions for the
          // whole room: otherwise the count stays >= 1 and the "=== 1" enable branch
          // (the only path that actually calls enableCaptions) never runs again.
          await sessionService.decrementCaptionsUserCount({ sessionKey });
          throw error;
        }

        res.status(200).json({ captionsId, status: 200 });
      } else {
        const captionsId = await sessionService.getCaptionsId({ sessionId });
        res.status(200).json({ captionsId, status: 200 });
      }
    } catch (error: unknown) {
      const applicationError = parseError('Failed to enable captions', error);

      res.status(applicationError.statusCode).json(applicationError);
    }
  }
);

sessionRouter.post(
  '/:room/:captionsId/disableCaptions',
  async (req: Request<{ room: string; captionsId: string }>, res: Response) => {
    try {
      const { room: roomName, captionsId } = req.params;
      const sessionKey = await getSessionKeyFromRoomName({ roomName });
      const { sessionId } = videoClient.decodeSessionKey({ sessionKey });

      const captionsUserCount = await sessionService.decrementCaptionsUserCount({ sessionKey });

      if (captionsUserCount === 0) {
        await videoClient.disableCaptions({ sessionKey, captionsId });
        await sessionService.setCaptionsId({ sessionId, captionsId: null });
      }

      res.status(200).json({ status: 200 });
    } catch (error: unknown) {
      const applicationError = parseError('Failed to disable captions', error);

      res.status(applicationError.statusCode).json(applicationError);
    }
  }
);

function parseError(message: string, error: unknown) {
  return makeInternalErrorHandler(message)(error).exportSafely();
}

export default sessionRouter;

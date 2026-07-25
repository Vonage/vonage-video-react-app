import { Request, Response, Router } from 'express';
import getSessionStorageService from '../sessionStorageService';
import { makeVideoClient$ } from './video';
import { makeInternalErrorHandler, makeNotFoundErrorHandler } from '@api-lib/errors';
import { getSessionKeyFromRoomName, getOrCreateSessionKeyFromRoomName } from '../helpers';

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

      // Ensure the archive belongs to this room's session before stopping it — otherwise a
      // caller who knows any room name could stop an archive from another room by its id.
      // Request up to 1000 archives to avoid missing archives on subsequent pages.
      const { items } = await videoClient.searchArchives({ sessionKey, count: 1000 });
      const archiveBelongsToRoom = items.some((archive) => archive.id === archiveId);

      if (!archiveBelongsToRoom) {
        const notFoundError = makeNotFoundErrorHandler('Archive not found for this room.')(
          new Error('Archive not found for this room.')
        );
        res.status(notFoundError.statusCode).json(notFoundError.exportSafely());
        return;
      }

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
        const { captionsId } = await videoClient.enableCaptions({ sessionKey });
        await sessionService.setCaptionsId({ sessionId, captionsId });
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

      // Only the captions actually associated with this room's session may be disabled —
      // don't trust the captionsId from the URL (it could target another room's captions).
      const storedCaptionsId = await sessionService.getCaptionsId({ sessionId });

      if (!storedCaptionsId || storedCaptionsId !== captionsId) {
        const notFoundError = makeNotFoundErrorHandler('Captions not found for this room.')(
          new Error('Captions not found for this room.')
        );
        res.status(notFoundError.statusCode).json(notFoundError.exportSafely());
        return;
      }

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

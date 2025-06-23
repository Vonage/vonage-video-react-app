import { Request, Response, Router } from 'express';
import validator from 'validator';
import createVideoService from '../videoService/videoServiceFactory';
import getSessionStorageService from '../sessionStorageService';
import createGetOrCreateSession from './getOrCreateSession';

const sessionRouter = Router();
const videoService = createVideoService();
const sessionService = getSessionStorageService();
const getOrCreateSession = createGetOrCreateSession({
  videoService,
  sessionService,
});

sessionRouter.get('/:room', async (req: Request<{ room: string }>, res: Response) => {
  try {
    const { room: roomName } = req.params;
    const sessionId = await getOrCreateSession(roomName);
    const data = videoService.generateToken(sessionId);
    const captionsId = await sessionService.getCaptionsId(roomName);
    res.json({
      sessionId,
      token: data.token,
      apiKey: data.apiKey,
      captionsId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : error;
    res.status(500).send({ message });
  }
});

sessionRouter.post('/:room/startArchive', async (req: Request<{ room: string }>, res: Response) => {
  try {
    const { room: roomName } = req.params;
    const sessionId = await sessionService.getSession(roomName);
    if (sessionId) {
      const archive = await videoService.startArchive(roomName, sessionId);
      res.json({
        archiveId: archive.id,
        status: 200,
      });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error: unknown) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
});

sessionRouter.post(
  '/:room/:archiveId/stopArchive',
  async (req: Request<{ room: string; archiveId: string }>, res: Response) => {
    try {
      const { archiveId } = req.params;
      if (archiveId) {
        const responseArchiveId = await videoService.stopArchive(archiveId);
        res.json({
          archiveId: responseArchiveId,
          status: 200,
        });
      }
    } catch (error: unknown) {
      res.status(500).send({ message: (error as Error).message ?? error });
    }
  }
);

sessionRouter.get('/:room/archives', async (req: Request<{ room: string }>, res: Response) => {
  try {
    const { room: roomName } = req.params;
    const sessionId = await sessionService.getSession(roomName);
    if (sessionId) {
      const archives = await videoService.listArchives(sessionId);
      res.json({
        archives,
        status: 200,
      });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
});

sessionRouter.post(
  '/:room/enableCaptions',
  async (req: Request<{ room: string }>, res: Response) => {
    try {
      const { room: roomName } = req.params;
      const sessionId = await sessionService.getSession(roomName);

      if (!sessionId) {
        res.status(404).json({ message: 'Room not found' });
        return;
      }

      const newCaptionCount = await sessionService.addCaptionsUser(roomName);

      if (newCaptionCount === 1) {
        const captions = await videoService.enableCaptions(sessionId);
        const { captionsId } = captions;
        await sessionService.setCaptionsId(roomName, captionsId);
        await videoService.sendSignalToSession(sessionId, {
          type: 'captions',
          data: JSON.stringify({
            action: 'enable',
            captionsId,
          }),
        });
        res.json({ captionsId, status: 200 });
      } else {
        // the captions were already enabled for this room
        const captionsId = await sessionService.getCaptionsId(roomName);
        res.json({
          captionsId,
          status: 200,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  }
);

sessionRouter.post(
  '/:room/:captionsId/disableCaptions',
  async (req: Request<{ room: string; captionsId: string }>, res: Response) => {
    try {
      const { room: roomName, captionsId } = req.params;

      // Validate the captionsId
      // the expected format is a UUID v4
      // for example: '123e4567-a12b-41a2-a123-123456789012'
      const isValidCaptionId = validator.isUUID(captionsId, 4);
      if (!isValidCaptionId) {
        res.status(400).json({ errorMessage: 'Invalid caption ID' });
        return;
      }

      const sessionId = await sessionService.getSession(roomName);
      const captionsUserCount = await sessionService.removeCaptionsUser(roomName);

      if (!sessionId) {
        res.status(404).json({ errorMessage: 'Room not found' });
        return;
      }

      if (captionsUserCount === 0) {
        const disableResponse = await videoService.disableCaptions(captionsId);
        await videoService.sendSignalToSession(sessionId, {
          type: 'captions',
          data: JSON.stringify({
            action: 'disable',
            captionsId,
          }),
        });
        await sessionService.setCaptionsId(roomName, '');
        res.json({
          disableResponse,
          status: 200,
        });
      } else {
        res.json({
          disableResponse: 'Captions are still active for other users',
          status: 200,
        });
      }
    } catch (error: unknown) {
      res.status(500).send({ errorMessage: (error as Error).message ?? error });
    }
  }
);

export default sessionRouter;

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

sessionRouter.get(
  '/:room/:tokenRole',
  async (req: Request<{ room: string; tokenRole: string }>, res: Response) => {
    try {
      const { room: roomName, tokenRole } = req.params;
      const sessionId = await getOrCreateSession(roomName);
      const data = videoService.generateToken(sessionId, tokenRole);
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
  }
);

sessionRouter.post(
  '/:room/:tokenRole/startArchive',
  async (req: Request<{ room: string; tokenRole: string }>, res: Response) => {
    try {
      const { room: roomName, tokenRole } = req.params;
      const sessionId = await sessionService.getSession(roomName);
      if (sessionId) {
        const archive = await videoService.startArchive(roomName, sessionId, tokenRole);
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
  }
);

sessionRouter.post(
  '/:room/:archiveId/:tokenRole/stopArchive',
  async (req: Request<{ room: string; archiveId: string; tokenRole: string }>, res: Response) => {
    try {
      const { archiveId, tokenRole } = req.params;
      if (archiveId) {
        const responseArchiveId = await videoService.stopArchive(archiveId, tokenRole);
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

sessionRouter.get(
  '/:room/:tokenRole/archives',
  async (req: Request<{ room: string; tokenRole: string }>, res: Response) => {
    try {
      const { room: roomName, tokenRole } = req.params;
      const sessionId = await sessionService.getSession(roomName);
      if (sessionId) {
        const archives = await videoService.listArchives(sessionId, tokenRole);
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
  }
);

sessionRouter.post(
  '/:room/:tokenRole/enableCaptions',
  async (req: Request<{ room: string; tokenRole: string }>, res: Response) => {
    try {
      const { room: roomName, tokenRole } = req.params;
      const sessionId = await sessionService.getSession(roomName);

      if (!sessionId) {
        res.status(404).json({ message: 'Room not found' });
        return;
      }

      const newCaptionCount = await sessionService.incrementCaptionsUserCount(roomName);

      if (newCaptionCount === 1) {
        const captions = await videoService.enableCaptions(sessionId, tokenRole);
        const { captionsId } = captions;
        await sessionService.setCaptionsId(roomName, captionsId);
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
  '/:room/:captionsId/:tokenRole/disableCaptions',
  async (req: Request<{ room: string; captionsId: string; tokenRole: string }>, res: Response) => {
    try {
      const { room: roomName, captionsId, tokenRole } = req.params;

      // Validate the captionsId
      // the expected format is a UUID v4
      // for example: '123e4567-a12b-41a2-a123-123456789012'
      const isValidCaptionId = validator.isUUID(captionsId, 4);
      if (!isValidCaptionId) {
        res.status(400).json({ message: 'Invalid caption ID' });
        return;
      }

      const sessionId = await sessionService.getSession(roomName);
      const captionsUserCount = await sessionService.decrementCaptionsUserCount(roomName);

      if (!sessionId) {
        res.status(404).json({ message: 'Room not found' });
        return;
      }

      // Only the last user to disable captions will send a request to disable captions session-wide
      if (captionsUserCount === 0 && tokenRole === 'admin') {
        const disableResponse = await videoService.disableCaptions(captionsId);
        await sessionService.setCaptionsId(roomName, '');
        res.json({
          disableResponse,
          status: 200,
        });
      } else {
        if (tokenRole !== 'admin') {
          res.status(403).json({ message: 'Only admin can disable captions' });
          return;
        }
        res.json({
          disableResponse: 'Captions are still active for other users',
          status: 200,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  }
);

export default sessionRouter;

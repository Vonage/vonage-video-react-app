import { Request, Response, Router } from 'express';
import createVideoService from '../videoServiceFactory';
import getSessionStorageService from '../sessionStorageService';

const sessionRouter = Router();
const videoService = createVideoService();
const sessionService = getSessionStorageService();

sessionRouter.get('/:room', async (req: Request, res: Response) => {
  try {
    const { room: roomName } = req.params;
    const sessionId = await sessionService.getSession(roomName);
    if (sessionId) {
      const data = videoService.generateToken(sessionId);
      res.json({
        sessionId,
        token: data.token,
        apiKey: data.apiKey,
      });
    } else {
      const data = await videoService.getCredentials();
      await sessionService.setSession(roomName, data.sessionId);
      res.json({
        sessionId: data.sessionId,
        token: data.token,
        apiKey: data.apiKey,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : error;
    res.status(500).send({ message });
  }
});

sessionRouter.post('/:room/startArchive', async (req: Request, res: Response) => {
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

sessionRouter.post('/:room/:archiveId/stopArchive', async (req: Request, res: Response) => {
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
});

sessionRouter.get('/:room/archives', async (req: Request, res: Response) => {
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

export default sessionRouter;

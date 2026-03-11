import { Request, Response, Router } from 'express';
import validator from 'validator';
import createVideoService from '../videoService/videoServiceFactory';
import getSessionStorageService from '../sessionStorageService';
import { createVideoClient } from '@api-lib/core';
import { SessionId } from '@common/types';
import blockCallsForArgs from '../helpers/blockCallsForArgs';
import { makeInternalErrorHandler } from '@api-lib/errors';

const sessionRouter = Router();
const videoService = createVideoService();
const sessionService = getSessionStorageService();

sessionRouter.get('/:room', async (req: Request<{ room: string }>, res: Response) => {
  try {
    const { room: roomName } = req.params;

    const videoClient = makeVideoClient();

    const captionsId = await sessionService.getCaptionsId(roomName);

    // the actual problem is that the roomName is not a valid identifier, and the creation of the session is async.
    // If the identifier where the sessionId, we wont need to block calls
    const session = await blockCallsForArgs(async () => {
      const sessionId = ((await sessionService.getSession(roomName)) as SessionId) ?? null;

      if (sessionId) {
        return {
          ...videoClient.decodeSessionId({ sessionId }),
          sessionId,
        };
      }

      const session = await videoClient.createSession();

      await sessionService.setSession(roomName, session.sessionId);

      return session;
    })(roomName);

    const { token } = videoClient.joinSession({
      sessionId: session.sessionId,
    });

    res.json({
      ...session,
      token,
      apiKey: session.applicationId,
      captionsId,
    });
  } catch (error) {
    const applicationError = makeInternalErrorHandler('Failed to get or create session')(
      error
    ).exportSafely();

    res.status(applicationError.statusCode).json(applicationError);
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
      const archives = await videoService.searchArchives(sessionId);
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

      const newCaptionCount = await sessionService.incrementCaptionsUserCount(roomName);

      if (newCaptionCount === 1) {
        const captions = await videoService.enableCaptions(sessionId);
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
  '/:room/:captionsId/disableCaptions',
  async (req: Request<{ room: string; captionsId: string }>, res: Response) => {
    try {
      const { room: roomName, captionsId } = req.params;

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
      if (captionsUserCount === 0) {
        const disableResponse = await videoService.disableCaptions(captionsId);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  }
);

function makeVideoClient() {
  return createVideoClient({
    auth: {
      authType: 'jwt',
      applicationId: process.env.VONAGE_APP_ID!,
      privateKey: process.env.VONAGE_PRIVATE_KEY!,
    },
    videoParams: {
      videoHost: process.env.VONAGE_VIDEO_HOST,
    },
  });
}

export default sessionRouter;

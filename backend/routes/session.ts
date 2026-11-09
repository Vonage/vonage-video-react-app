import { Request, Response, Router } from 'express';
import getSessionStorageService from '../sessionStorageService';
import { makeVideoClient$ } from './video';
import { makeInternalErrorHandler } from '@api-lib/errors';
import { getOrCreateSessionKeyFromRoomName } from '../helpers';
import type { RequestWithTokenAuth } from '../middleware/authMiddleware/authMiddleware';

const sessionRouter = Router();
const sessionService = getSessionStorageService();

const videoClient = makeVideoClient$();

sessionRouter.get('/:room', async (req: Request<{ room: string }>, res: Response) => {
  try {
    const { room: roomName } = req.params;
    const sessionKey = await getOrCreateSessionKeyFromRoomName({
      videoClient,
      roomName,
      user: (req as RequestWithTokenAuth).user,
    });

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

function parseError(message: string, error: unknown) {
  return makeInternalErrorHandler(message)(error).exportSafely();
}

export default sessionRouter;

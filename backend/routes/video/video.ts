import { Router } from 'express';
import { createVideoHandler } from '@api-lib';
import { createSession, startArchive, enableCaptions, joinSession } from './constants';

const videoRouter = Router();

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

videoRouter.use(videoHandler);

export const { makeVideoClient$ } = videoHandler.router$;

export type VideoClient = ReturnType<typeof makeVideoClient$>;

export default videoRouter;

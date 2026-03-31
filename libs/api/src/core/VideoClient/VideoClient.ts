import type { Any } from '@common/types';
import { Video } from '@vonage/video';
import { Auth } from '@vonage/auth';
import { assertVideoClientConfig } from '@api-lib/schemas';
import {
  createSession,
  decodeSessionId,
  startArchive,
  stopArchive,
  searchArchives,
  enableCaptions,
  disableCaptions,
  createEphemeralToken,
  joinSession,
} from '@api-lib/handlers';
import { VideoAction, type VideoClientConfig } from '@api-lib/types';
import schemasByAction from '@api-lib/constants/schemasByAction';
import { makeBadRequestErrorHandler } from '@api-lib/errors';

/**
 * Forces VideoClient to have a method for each VideoAction
 * and correctly types the payload and return type
 */
type IVideoClient = {
  [key in VideoAction]: (this: VideoClient, ...args: Any[]) => unknown;
};

class VideoClient implements IVideoClient {
  public readonly _auth: Auth;

  public readonly _video: Video;

  constructor(config: VideoClientConfig) {
    assertVideoClientConfig(config);

    const { auth, videoParams } = config;

    this._auth = auth instanceof Auth ? auth : new Auth(auth);
    this._video = new Video(this._auth, videoParams);
  }

  /**
   * VideoClient instance should be used for one single session and requests
   */
  protected createVideoHandler<Action extends (this: this, payload: Any) => unknown>(
    videoAction: VideoAction,
    action: Action
  ): Action {
    const callback = action.bind(this);

    return ((payload: Any) => {
      // validate payload schema for the given action
      const { error } = schemasByAction[videoAction].safeParse(payload);

      if (error) {
        throw makeBadRequestErrorHandler(`Invalid payload for action ${videoAction}`)(error);
      }

      return callback(payload);
    }) as Action;
  }

  /**
   * Creates an ephemeral client token with a default 30 seconds expiration time
   * This token is meant to be used for server-to-server operations that require a token
   */
  public createEphemeralToken = this.createVideoHandler(
    VideoAction.createEphemeralToken,
    createEphemeralToken
  );

  /**
   * Creates or retrieves a session based on the provided sessionId
   */
  public createSession = this.createVideoHandler(VideoAction.createSession, createSession);

  /**
   * Decodes a sessionId and returns its components
   */
  public decodeSessionId = this.createVideoHandler(VideoAction.decodeSessionId, decodeSessionId);

  /**
   * Starts an archive for a given session
   */
  public startArchive = this.createVideoHandler(VideoAction.startArchive, startArchive);

  /**
   * Stops an archive for a given session
   */
  public stopArchive = this.createVideoHandler(VideoAction.stopArchive, stopArchive);

  /**
   * Searches archives for a given session
   */
  public searchArchives = this.createVideoHandler(VideoAction.searchArchives, searchArchives);

  /**
   *  Enables captions for a given session
   */
  public enableCaptions = this.createVideoHandler(VideoAction.enableCaptions, enableCaptions);

  /**
   * Disables captions for a given session
   */
  public disableCaptions = this.createVideoHandler(VideoAction.disableCaptions, disableCaptions);

  /**
   * Joins an existing session
   */
  public joinSession = this.createVideoHandler(VideoAction.joinSession, joinSession);
}

export default VideoClient;

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
  ensureCaptionsEnabled,
  disableCaptions,
  createEphemeralToken,
  joinSession,
  decodeSessionKey,
  createSessionAndJoin,
} from '@api-lib/handlers';
import {
  type HandlersDefaults,
  VideoAction,
  type VideoClientConfig,
  type SessionSigning,
} from '@api-lib/types';
import schemasByAction from '@api-lib/constants/schemasByAction';
import { makeBadRequestErrorHandler } from '@api-lib/errors';
import { isFunction } from '@common/assertions';

/**
 * Forces VideoClient to have a method for each VideoAction
 * and correctly types the payload and return type
 */
type IVideoClient = {
  [key in VideoAction]: (this: VideoClient, ...args: Any[]) => unknown;
};

class VideoClient implements IVideoClient {
  public readonly auth: Auth;

  public readonly video: Video;

  public readonly _handlersDefaults:
    | Partial<
        HandlersDefaults &
          // these handlers inherit the defaults from the other handlers
          {
            ensureCaptionsEnabled: HandlersDefaults['enableCaptions'];
          }
      >
    | undefined;

  public readonly _sessionSigning: SessionSigning;

  constructor(config: VideoClientConfig) {
    assertVideoClientConfig(config);

    const { auth, videoParams, handlersDefaults } = config;

    this.auth = auth instanceof Auth ? auth : new Auth(auth);
    this.video = new Video(this.auth, videoParams);

    // some defaults are shared between handlers
    this._handlersDefaults = {
      ensureCaptionsEnabled: handlersDefaults?.enableCaptions,

      ...handlersDefaults,
    };

    // This provides lightweight integrity verification of session keys,
    // It is not intended for authentication or authorization.
    // Consumers are responsible for implementing proper auth at the application level.
    this._sessionSigning = {
      secret: config.sessionSigning?.secret || this.auth.applicationId || this.auth.apiKey,
      algorithm: config.sessionSigning?.algorithm || 'HS256',
    };
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

      const defaultsSrc = this._handlersDefaults?.[videoAction as keyof HandlersDefaults];
      const defaults = (isFunction(defaultsSrc) ? defaultsSrc(payload) : defaultsSrc) as Record<
        string,
        unknown
      >;

      return callback({
        ...defaults,
        ...payload,
      });
    }) as Action;
  }

  /**
   * Decodes a session key to retrieve the session details.
   */
  public decodeSessionKey = decodeSessionKey;

  /**
   * Decodes a sessionId and returns its components
   */
  public decodeSessionId = decodeSessionId;

  /**
   * Creates an ephemeral client token with a default 30 seconds expiration time
   * This token is meant to be used for server-to-server operations that require a token
   */
  public createEphemeralToken = this.createVideoHandler(
    VideoAction.createEphemeralToken,
    createEphemeralToken
  );

  /**
   * Creates or retrieves a session based on the provided sessionKey
   */
  public createSession = this.createVideoHandler(VideoAction.createSession, createSession);

  /**
   * Creates a session and generates a token to join it in one step. This is useful to avoid
   * multiple round trips when both creating a session and joining it are required.
   */
  public createSessionAndJoin = this.createVideoHandler(
    VideoAction.createSessionAndJoin,
    createSessionAndJoin
  );

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
   *  Enables captions for a given session, returns the captions response
   */
  public enableCaptions = this.createVideoHandler(VideoAction.enableCaptions, enableCaptions);

  /**
   * Ensures captions are enabled for a given session, returns void
   */
  public ensureCaptionsEnabled = this.createVideoHandler(
    VideoAction.ensureCaptionsEnabled,
    ensureCaptionsEnabled
  );

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

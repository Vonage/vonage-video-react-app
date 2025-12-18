import { VeraAction } from './schemas/VeraAction';
import { ActionResult } from './schemas/ActionResult';
import getOrCreateSession from './actions/getOrCreateSession';
import type { ActionInput, IVideoProvider } from '../../types';
import type { IStorageProvider } from '../../schemas/StorageProvider.zod';
import startArchive from './actions/startArchive';
import disableCaptions from './actions/disableCaptions';
import enableCaptions from './actions/enableCaptions';
import listArchives from './actions/listArchives';
import stopArchive from './actions/stopArchive';

/**
 * Forces ActionExecutor to have a method for each VeraAction
 * and correctly types the payload and return type
 */
type HandlerMap = {
  [key in VeraAction]: (
    this: ActionExecutor,
    payload: ActionInput<key>
  ) => ActionResult<unknown> | Promise<ActionResult<unknown>>;
};

class ActionExecutor implements HandlerMap {
  public storageProvider: IStorageProvider;
  public videoProvider: IVideoProvider;

  constructor(args: { storageProvider: IStorageProvider; videoProvider: IVideoProvider }) {
    this.storageProvider = args.storageProvider;
    this.videoProvider = args.videoProvider;
  }

  /**
   * Creates or retrieves a session ID for a given room
   * [TODO]: We should receive the sessionId not the room name, room name must be informational only
   */
  getOrCreateSession = getOrCreateSession;

  /**
   * Starts an archive for a given session
   */
  startArchive = startArchive;

  /**
   * Stops an archive for a given session
   */
  stopArchive = stopArchive;

  /**
   * Lists archives for a given session
   */
  listArchives = listArchives;

  /**
   *  Enables captions for a given session
   */
  enableCaptions = enableCaptions;

  /**
   * Disables captions for a given session
   */
  disableCaptions = disableCaptions;
}

export default ActionExecutor;

import { VeraAction } from './schemas/VeraAction';
import { ActionResult } from './schemas/ActionResult';
import getOrCreateSession from './actions/getOrCreateSession';
import type { ActionInput } from '../../types';

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
  getOrCreateSession = getOrCreateSession;

  startArchive: (payload: ActionInput<'startArchive'>) => ActionResult<unknown> = null as any;

  stopArchive: (payload: ActionInput<'stopArchive'>) => ActionResult<unknown> = null as any;

  listArchives: (payload: ActionInput<'listArchives'>) => ActionResult<unknown> = null as any;

  enableCaptions: (payload: ActionInput<'enableCaptions'>) => ActionResult<unknown> = null as any;

  disableCaptions: (payload: ActionInput<'disableCaptions'>) => ActionResult<unknown> = null as any;
}

export default ActionExecutor;

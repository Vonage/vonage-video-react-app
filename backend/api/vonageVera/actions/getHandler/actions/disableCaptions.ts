import { ActionInput } from '../../../types';
import { ActionResult } from '../schemas/ActionResult';

type ActionExecutor = import('../ActionExecutor').default;

type Result = ActionResult<{
  sessionId: string;
}>;

async function disableCaptions(
  this: ActionExecutor,
  payload: ActionInput<'disableCaptions'>
): Promise<Result> {
  // Implementation for disabling captions
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return null as any;
}

export default disableCaptions as any;

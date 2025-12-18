type Handler = import('../ActionExecutor').default;
import type { ActionInput } from '../../../types';
import { ActionResult } from '../schemas/ActionResult';

type Result = ActionResult<{
  sessionId: string;
}>;

async function getOrCreateSession(
  this: Handler,
  payload: ActionInput<'getOrCreateSession'>
): Promise<Result> {
  const { room: roomName } = payload;

  const sessionId = await (async (): string => {
    await sessionService.getSession(roomName);

    if (!sessionId) {
      sessionId = await videoService.createSession();
      await sessionService.setSession(roomName, sessionId);
    }
  })();

  return {
    success: true,
    message: null,
    data: {
      sessionId,
    },
  };
}

export default getOrCreateSession;

type ActionExecutor = import('../ActionExecutor').default;

import type { ActionInput } from '../../../types';
import { ActionResult } from '../schemas/ActionResult';

type Result = ActionResult<{
  sessionId: string;
}>;

async function getOrCreateSession(
  this: ActionExecutor,
  payload: ActionInput<'getOrCreateSession'>
): Promise<Result> {
  //   const { room: roomName } = payload;
  //   const sessionIdKey = `sessions:${roomName}`;

  // TODO: Validate integrity of sessionId if provided
  // const { sessionId } = payload;

  // TODO: Refinements
  //   const sessionId = await (async () => {
  //     let sessionId = await this.storageProvider.getItem(sessionIdKey);
  //     if (sessionId) return sessionId;

  //     sessionId = await this.videoProvider.createSession();
  //     await this.storageProvider.setItem(sessionIdKey, sessionId);

  //     return sessionId;
  //   })();

  const sessionId = await (async () => {
    // TODO: Validate sessionId format and integrity
    if (payload.sessionId) return payload.sessionId;

    return this.videoProvider.createSession();
  })();

  return {
    success: true,
    message: 'Session retrieved or created successfully',
    data: {
      sessionId,
    },
  };
}

export default getOrCreateSession;

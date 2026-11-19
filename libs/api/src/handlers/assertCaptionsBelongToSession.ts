import { makeNotFoundErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import type { IVideoClient } from '@api-lib/types';
import { assertResult } from '@common/execution';

async function assertCaptionsBelongToSession({
  videoClient,
  sessionKey,
  captionsId,
}: {
  videoClient: IVideoClient;
  sessionKey: string;
  captionsId: string;
}): Promise<void> {
  const { sessionId } = videoClient.decodeSessionKey({ sessionKey });

  const captionsStatus = await assertResult(
    () => videoClient.video.getCaptionStatus(captionsId),
    makeThirdPartyErrorHandler('Failed to get captions status')
  );

  if (captionsStatus.sessionId === sessionId) return;

  throw makeNotFoundErrorHandler('Captions not found for this session')(null);
}

export default assertCaptionsBelongToSession;

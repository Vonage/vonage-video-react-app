import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import type { IVideoClient, StartArchivePayload } from '@api-lib/types';
import { assertResult } from '@common/execution';
import type { SingleArchiveResponse } from '@vonage/video';

async function startArchive(
  this: IVideoClient,
  payload: StartArchivePayload
): Promise<SingleArchiveResponse> {
  try {
    const { sessionKey, archiveOptions } = payload;
    const { sessionId } = this.decodeSessionKey({ sessionKey });

    const archive = await assertResult(
      () => this.video.startArchive(sessionId, archiveOptions),
      makeThirdPartyErrorHandler('Failed to start archive')
    );

    return archive;
  } catch (error: unknown) {
    throw makeInternalErrorHandler('Failed to start archive')(error);
  }
}

export default startArchive;

import {
  makeInternalErrorHandler,
  makeNotFoundErrorHandler,
  makeThirdPartyErrorHandler,
} from '@api-lib/errors';
import type { IVideoClient, StopArchivePayload } from '@api-lib/types';
import { assertResult } from '@common/execution';
import type { SingleArchiveResponse } from '@vonage/video';

async function stopArchive(
  this: IVideoClient,
  payload: StopArchivePayload
): Promise<SingleArchiveResponse> {
  const { archiveId, sessionKey } = payload;

  try {
    const { sessionId } = this.decodeSessionKey({ sessionKey });

    const archive = await assertResult(
      () => this.video.getArchive(archiveId!),
      makeThirdPartyErrorHandler('Failed to get archive')
    );

    if (archive.sessionId !== sessionId) {
      throw makeNotFoundErrorHandler('Archive not found for this session')(null);
    }

    const archiveResponse = await assertResult(
      () => this.video.stopArchive(archiveId!),
      makeThirdPartyErrorHandler('Failed to stop archive')
    );

    return archiveResponse;
  } catch (error: unknown) {
    throw makeInternalErrorHandler('Failed to stop archive')(error);
  }
}

export default stopArchive;

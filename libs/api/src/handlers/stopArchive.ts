import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import type { IVideoClient, StopArchivePayload } from '@api-lib/types';
import { assertResult } from '@common/execution';
import type { SingleArchiveResponse } from '@vonage/video';

async function stopArchive(
  this: IVideoClient,
  payload: StopArchivePayload
): Promise<SingleArchiveResponse> {
  const { archiveId } = payload;

  try {
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

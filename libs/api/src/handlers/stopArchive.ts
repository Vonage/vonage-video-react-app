import { makeThirdPartyErrorHandler } from '@api-lib/errors';
import makeInternalErrorHandler from '@api-lib/errors/handlers/makeInternalErrorHandler/makeInternalErrorHandler';
import type { IVideoOrchestrator, StopArchivePayload } from '@api-lib/types';
import { assertResult } from '@common/execution';
import type { SingleArchiveResponse } from '@vonage/video';

async function stopArchive(
  this: IVideoOrchestrator,
  payload: StopArchivePayload
): Promise<SingleArchiveResponse> {
  try {
    const archiveResponse = await assertResult(
      () => this.video$.stopArchive(payload.archiveId),
      makeThirdPartyErrorHandler('Failed to stop archive')
    );

    return archiveResponse;
  } catch (error: unknown) {
    throw makeInternalErrorHandler('Failed to stop archive')(error);
  }
}

export default stopArchive;

import { makeThirdPartyErrorHandler } from '@api-lib/errors';
import makeInternalErrorHandler from '@api-lib/errors/handlers/makeInternalErrorHandler/makeInternalErrorHandler';
import type { IVideoOrchestrator, SearchArchivesPayload } from '@api-lib/types';
import { assertResult } from '@common/execution';
import formatToStore from 'json-storage-formatter/formatToStore';

async function searchArchives(this: IVideoOrchestrator, payload: SearchArchivesPayload) {
  try {
    const archives = await assertResult(
      () => this.video$.searchArchives(payload),
      makeThirdPartyErrorHandler(`Failed to search archives with filters ${formatToStore(payload)}`)
    );

    return archives;
  } catch (error: unknown) {
    throw makeInternalErrorHandler('Failed to search archives')(error);
  }
}

export default searchArchives;

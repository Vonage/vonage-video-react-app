import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import type { IVideoClient, SearchArchivesPayload } from '@api-lib/types';
import { assertResult } from '@common/execution';
import formatToStore from 'json-storage-formatter/formatToStore';

async function searchArchives(this: IVideoClient, payload: SearchArchivesPayload) {
  try {
    const archives = await assertResult(
      () => this._video.searchArchives(payload),
      makeThirdPartyErrorHandler(`Failed to search archives with filters ${formatToStore(payload)}`)
    );

    return archives;
  } catch (error: unknown) {
    throw makeInternalErrorHandler('Failed to search archives')(error);
  }
}

export default searchArchives;

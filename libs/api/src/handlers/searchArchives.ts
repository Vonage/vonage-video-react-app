import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import type { IVideoClient, SearchArchivesPayload } from '@api-lib/types';
import { assertResult } from '@common/execution';

async function searchArchives(this: IVideoClient, payload: SearchArchivesPayload) {
  try {
    const { sessionKey, ...filter } = payload;
    const { sessionId } = sessionKey ? this.decodeSessionKey({ sessionKey }) : {};

    const archives = await assertResult(
      () => this.video.searchArchives({ sessionId, ...filter }),
      makeThirdPartyErrorHandler(
        `Failed to search archives with filters ${JSON.stringify(payload)}`
      )
    );

    return archives;
  } catch (error: unknown) {
    throw makeInternalErrorHandler('Failed to search archives')(error);
  }
}

export default searchArchives;

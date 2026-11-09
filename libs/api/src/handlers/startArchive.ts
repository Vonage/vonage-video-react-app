import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import type { IVideoClient, StartArchivePayload } from '@api-lib/types';
import assertScheduleOpen from '@api-lib/schedule/assertScheduleOpen';
import { isNotNil } from '@common/assertions';
import { SessionKeyClaim } from '@common/constants';
import { assertResult } from '@common/execution';
import type { SingleArchiveResponse } from '@vonage/video';

async function startArchive(
  this: IVideoClient,
  payload: StartArchivePayload
): Promise<SingleArchiveResponse> {
  try {
    const { sessionKey, archiveOptions } = payload;
    const session = this.decodeSessionKey({ sessionKey });
    const schedule = session[SessionKeyClaim.schedule];

    if (isNotNil(schedule)) assertScheduleOpen(schedule);

    const archive = await assertResult(
      () => this.video.startArchive(session.sessionId, archiveOptions),
      makeThirdPartyErrorHandler('Failed to start archive')
    );

    return archive;
  } catch (error: unknown) {
    throw makeInternalErrorHandler('Failed to start archive')(error);
  }
}

export default startArchive;

import { makeBadRequestErrorHandler } from '@api-lib/errors';
import type { IVideoClient } from '@api-lib/types';
import { isNil } from '@common/assertions';
import { getScheduleWindow } from '@common/helpers';
import signExtendedSessionKey from './signExtendedSessionKey';

/**
 * Signs the sessionKey with the extended minutes and joins it with a token that expires at the extended end.
 */
function joinExtendedSession({
  videoClient,
  sessionKey,
  extendedMinutes,
}: {
  videoClient: IVideoClient;
  sessionKey: string;
  extendedMinutes: number;
}) {
  const extendedSessionKey = signExtendedSessionKey({
    sessionSigning: videoClient._sessionSigning,
    sessionKey,
    extendedMinutes,
  });

  const scheduleWindow = getScheduleWindow(
    videoClient.decodeSessionKey({ sessionKey: extendedSessionKey })
  );

  if (isNil(scheduleWindow)) {
    throw makeBadRequestErrorHandler('Only scheduled sessions can be extended')(null);
  }

  return videoClient.joinSession({
    sessionKey: extendedSessionKey,
    clientTokenOptions: { expireTime: Math.floor(scheduleWindow.endsAt / 1000) },
  });
}

export default joinExtendedSession;

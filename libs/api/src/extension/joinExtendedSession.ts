import { makeBadRequestErrorHandler } from '@api-lib/errors';
import type { IVideoClient } from '@api-lib/types';
import { isNil } from '@common/assertions';
import { SessionKeyClaim } from '@common/constants';
import signExtendedSessionKey from './signExtendedSessionKey';

function joinExtendedSession({
  videoClient,
  sessionKey,
  extendedMinutes,
}: {
  videoClient: IVideoClient;
  sessionKey: string;
  extendedMinutes: number;
}) {
  const session = videoClient.decodeSessionKey({ sessionKey });
  const schedule = session[SessionKeyClaim.schedule];

  if (isNil(schedule)) {
    throw makeBadRequestErrorHandler('Only scheduled sessions can be extended')(null);
  }

  const addedMinutes = extendedMinutes - (session[SessionKeyClaim.extended] ?? 0);
  const extendedSchedule = {
    startsAtMs: schedule.startsAtMs,
    endsAtMs: schedule.endsAtMs + addedMinutes * 60_000,
  };

  const extendedSessionKey = signExtendedSessionKey({
    sessionSigning: videoClient._sessionSigning,
    sessionKey,
    schedule: extendedSchedule,
    extendedMinutes,
  });

  return videoClient.joinSession({
    sessionKey: extendedSessionKey,
    clientTokenOptions: { expireTime: Math.floor(extendedSchedule.endsAtMs / 1000) },
  });
}

export default joinExtendedSession;

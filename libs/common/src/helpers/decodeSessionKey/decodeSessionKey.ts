import { isNumber, isRecord } from '@common/assertions';
import type { SessionKeyPayload, VideoSessionDetails } from '@common/types';
import decodeJwt from '../decodeJwt';
import decodeSessionId from '../decodeSessionId';

const decodeSessionKey = ({ sessionKey }: { sessionKey: string }): VideoSessionDetails => {
  const tokenPayload = decodeJwt<SessionKeyPayload>(sessionKey);
  const session = decodeSessionId({ sessionId: tokenPayload.sessionId });

  const schedule = (() => {
    const claim = tokenPayload.schedule;
    if (!isRecord(claim)) return undefined;
    const { startsAtMs, endsAtMs } = claim;
    const isSchedule = isNumber(startsAtMs) && isNumber(endsAtMs) && endsAtMs > startsAtMs;
    if (!isSchedule) return undefined;
    return { startsAtMs, endsAtMs };
  })();

  return { ...session, ...tokenPayload, sessionKey, schedule };
};

export default decodeSessionKey;

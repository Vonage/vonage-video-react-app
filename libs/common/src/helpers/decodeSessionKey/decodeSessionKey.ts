import { SessionKeyPayload, VideoSessionDetails } from '@common/types';
import decodeJwt from '../decodeJwt';
import decodeSessionId from '../decodeSessionId';

const decodeSessionKey = ({ sessionKey }: { sessionKey: string }): VideoSessionDetails => {
  const tokenPayload = decodeJwt<SessionKeyPayload>(sessionKey);
  const session = decodeSessionId({ sessionId: tokenPayload.sessionId });

  return { ...session, ...tokenPayload, sessionKey };
};

export default decodeSessionKey;

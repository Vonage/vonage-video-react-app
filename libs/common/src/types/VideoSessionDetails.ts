import DecodedSessionId from './DecodedSessionId';
import { Prettify } from './Prettify';
import type { SessionKeyPayload } from './SessionKeyPayload';

export type VideoSessionDetails = Prettify<
  DecodedSessionId &
    SessionKeyPayload & {
      sessionKey: string;
    }
>;

export default VideoSessionDetails;

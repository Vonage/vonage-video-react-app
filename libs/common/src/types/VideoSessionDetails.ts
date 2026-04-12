import DecodedSessionId from './DecodedSessionId';
import { Prettify } from './Prettify';

export type VideoSessionDetails = Prettify<
  DecodedSessionId & {
    sessionKey: string;
    sessionId: string;
    roomName?: string | null | undefined;
  }
>;

export default VideoSessionDetails;

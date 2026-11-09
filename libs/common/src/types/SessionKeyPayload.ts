import type { SessionKeyClaim } from '../constants/SessionKeyClaim';
import type { ScheduleWindow } from './ScheduleWindow';

export type SessionKeyPayload = {
  sessionId: string;
  roomName?: string | null | undefined;
  [SessionKeyClaim.schedule]?: ScheduleWindow;
};

export default SessionKeyPayload;

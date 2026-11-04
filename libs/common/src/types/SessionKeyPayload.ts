import type { SessionKeyClaim } from '../constants/SessionKeyClaim';
import type { ScheduleWindow } from './ScheduleWindow';

export type SessionKeyPayload = {
  sessionId: string;
  roomName?: string | null | undefined;
  [SessionKeyClaim.schedule]?: ScheduleWindow;
  /**
   * Minutes already added to the scheduled end by extensions.
   */
  [SessionKeyClaim.extended]?: number;
};

export default SessionKeyPayload;

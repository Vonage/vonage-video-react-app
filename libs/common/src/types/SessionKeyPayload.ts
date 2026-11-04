import type { SessionKeyClaim } from '../constants/SessionKeyClaim';
import type { ScheduleClaim } from './ScheduleClaim';

type BaseSessionKeyPayload = {
  sessionId: string;
  roomName?: string | null | undefined;
};

export type UnscheduledSessionKeyPayload = BaseSessionKeyPayload &
  Partial<Record<typeof SessionKeyClaim.schedule, never>> &
  Partial<Record<typeof SessionKeyClaim.extended, never>>;

export type ScheduledSessionKeyPayload = BaseSessionKeyPayload &
  Record<typeof SessionKeyClaim.schedule, ScheduleClaim> &
  /**
   * Minutes added to the scheduled duration by extensions.
   */
  Partial<Record<typeof SessionKeyClaim.extended, number>>;

export type SessionKeyPayload = UnscheduledSessionKeyPayload | ScheduledSessionKeyPayload;

export default SessionKeyPayload;

import type { ScheduleWindow } from '@common/types';

export type ScheduleStatus =
  | { kind: 'unscheduled' }
  | (ScheduleWindow & { kind: 'daysAway'; daysLeft: number })
  | (ScheduleWindow & { kind: 'withinDay'; minutesLeft: number })
  | (ScheduleWindow & { kind: 'withinHour'; minutesLeft: number })
  | (ScheduleWindow & { kind: 'withinFiveMinutes'; secondsLeft: number })
  | (ScheduleWindow & { kind: 'started' })
  | { kind: 'ended'; endsAtMs: number }
  | (ScheduleWindow & { kind: 'pending' });

export type ScheduledStatus = Exclude<ScheduleStatus, { kind: 'unscheduled' }>;
export type WaitingStatus = Exclude<ScheduledStatus, { kind: 'started' | 'ended' | 'pending' }>;

export default ScheduleStatus;

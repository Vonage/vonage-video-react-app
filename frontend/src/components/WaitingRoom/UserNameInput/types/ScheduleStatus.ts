type UpcomingScheduleTimes = {
  startsAt: number;
  endsAt: number;
};

export type ScheduleStatus =
  | { kind: 'unscheduled' }
  | (UpcomingScheduleTimes & { kind: 'daysAway'; daysLeft: number })
  | (UpcomingScheduleTimes & { kind: 'withinDay'; minutesLeft: number })
  | (UpcomingScheduleTimes & { kind: 'withinHour'; minutesLeft: number })
  | (UpcomingScheduleTimes & { kind: 'withinFiveMinutes'; secondsLeft: number })
  | (UpcomingScheduleTimes & { kind: 'started' })
  | { kind: 'ended'; endsAt: number };

export type ScheduledStatus = Exclude<ScheduleStatus, { kind: 'unscheduled' }>;

export type WaitingStatus = Exclude<ScheduledStatus, { kind: 'started' | 'ended' }>;

export default ScheduleStatus;

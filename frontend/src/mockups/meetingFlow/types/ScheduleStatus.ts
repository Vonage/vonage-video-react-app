type UpcomingBase = {
  startsAt: Date;
  endsAt: Date;
  isRecurring: boolean;
};

export type ScheduleStatus =
  | { kind: 'unscheduled' }
  | (UpcomingBase & { kind: 'daysAway'; daysLeft: number })
  | (UpcomingBase & { kind: 'withinDay'; minutesLeft: number })
  | (UpcomingBase & { kind: 'withinHour'; minutesLeft: number })
  | (UpcomingBase & { kind: 'withinFiveMinutes'; secondsLeft: number })
  | (UpcomingBase & { kind: 'started' })
  | { kind: 'ended'; endsAt: Date; isRecurring: boolean };

export type ScheduleStatusKind = ScheduleStatus['kind'];

export default ScheduleStatus;

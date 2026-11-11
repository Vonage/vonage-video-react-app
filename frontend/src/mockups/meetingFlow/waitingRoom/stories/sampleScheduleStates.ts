import mockupNow from '../../sampleData/mockupNow';
import type { MeetingSchedule } from '../../types/MeetingSchedule';

export type SampleScheduleState = {
  key:
    | 'unscheduled'
    | 'daysAway'
    | 'withinDay'
    | 'withinHour'
    | 'withinFiveMinutes'
    | 'autoJoinOn'
    | 'started'
    | 'ended'
    | 'recurring';
  meetingName: string;
  schedule: MeetingSchedule | null;
  username: string;
  isAutoJoinEnabled: boolean;
};

const minutesFromNow = (minutes: number) => new Date(mockupNow.getTime() + minutes * 60_000);

/**
 * One sample per waiting-room state, all relative to the mockup clock (Mon, Nov 2, 2:00 PM).
 */
const sampleScheduleStates: SampleScheduleState[] = [
  {
    key: 'unscheduled',
    meetingName: 'Open help desk',
    schedule: null,
    username: '',
    isAutoJoinEnabled: false,
  },
  {
    key: 'daysAway',
    meetingName: 'Customer onboarding: Acme',
    schedule: { startsAt: new Date(2026, 10, 5, 16, 0), durationMinutes: 60, recurrence: 'none' },
    username: '',
    isAutoJoinEnabled: false,
  },
  {
    key: 'withinDay',
    meetingName: 'Budget check-in',
    schedule: { startsAt: new Date(2026, 10, 3, 9, 30), durationMinutes: 30, recurrence: 'none' },
    username: '',
    isAutoJoinEnabled: false,
  },
  {
    key: 'withinHour',
    meetingName: 'Design review',
    schedule: { startsAt: minutesFromNow(42), durationMinutes: 45, recurrence: 'none' },
    username: '',
    isAutoJoinEnabled: false,
  },
  {
    key: 'withinFiveMinutes',
    meetingName: 'Design review',
    schedule: { startsAt: minutesFromNow(4.54), durationMinutes: 45, recurrence: 'none' },
    username: 'Ana García',
    isAutoJoinEnabled: false,
  },
  {
    key: 'autoJoinOn',
    meetingName: 'Design review',
    schedule: { startsAt: minutesFromNow(4.54), durationMinutes: 45, recurrence: 'none' },
    username: 'Ana García',
    isAutoJoinEnabled: true,
  },
  {
    key: 'started',
    meetingName: 'Design review',
    schedule: { startsAt: minutesFromNow(-2), durationMinutes: 45, recurrence: 'none' },
    username: 'Ana García',
    isAutoJoinEnabled: false,
  },
  {
    key: 'ended',
    meetingName: 'Q3 planning',
    schedule: { startsAt: minutesFromNow(-120), durationMinutes: 60, recurrence: 'none' },
    username: '',
    isAutoJoinEnabled: false,
  },
  {
    key: 'recurring',
    meetingName: 'Weekly team sync',
    schedule: { startsAt: new Date(2026, 10, 9, 9, 30), durationMinutes: 30, recurrence: 'weekly' },
    username: '',
    isAutoJoinEnabled: false,
  },
];

export default sampleScheduleStates;

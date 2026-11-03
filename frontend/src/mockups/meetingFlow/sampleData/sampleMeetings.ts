import type { SavedMeeting } from '../types/SavedMeeting';
import type { SavedMeetingId } from '../types/SavedMeetingId';

const sampleMeetings: SavedMeeting[] = [
  {
    id: 'meeting:design-review' as SavedMeetingId,
    name: 'Design review',
    createdAt: new Date(2026, 9, 28, 10, 0),
    schedule: {
      startsAt: new Date(2026, 10, 2, 14, 25),
      durationMinutes: 45,
      recurrence: 'none',
    },
    isArchived: false,
  },
  {
    id: 'meeting:weekly-sync' as SavedMeetingId,
    name: 'Weekly team sync',
    createdAt: new Date(2026, 8, 1, 9, 0),
    schedule: {
      startsAt: new Date(2026, 10, 3, 9, 30),
      durationMinutes: 30,
      recurrence: 'weekly',
    },
    isArchived: false,
  },
  {
    id: 'meeting:acme-onboarding' as SavedMeetingId,
    name: 'Customer onboarding: Acme',
    createdAt: new Date(2026, 9, 30, 16, 0),
    schedule: {
      startsAt: new Date(2026, 10, 5, 16, 0),
      durationMinutes: 60,
      recurrence: 'none',
    },
    isArchived: false,
  },
  {
    id: 'meeting:all-hands' as SavedMeetingId,
    name: 'All-hands broadcast',
    createdAt: new Date(2026, 9, 20, 12, 0),
    schedule: {
      startsAt: new Date(2026, 10, 9, 17, 0),
      durationMinutes: 90,
      recurrence: 'monthly',
    },
    isArchived: false,
  },
  {
    id: 'meeting:help-desk' as SavedMeetingId,
    name: 'Open help desk',
    createdAt: new Date(2026, 9, 2, 8, 0),
    schedule: null,
    isArchived: false,
  },
  {
    id: 'meeting:q3-planning' as SavedMeetingId,
    name: 'Q3 planning',
    createdAt: new Date(2026, 9, 1, 9, 0),
    schedule: {
      startsAt: new Date(2026, 9, 30, 11, 0),
      durationMinutes: 60,
      recurrence: 'none',
    },
    isArchived: true,
  },
  {
    id: 'meeting:frontend-interview' as SavedMeetingId,
    name: 'Interview: frontend engineer',
    createdAt: new Date(2026, 9, 21, 15, 0),
    schedule: {
      startsAt: new Date(2026, 9, 28, 15, 30),
      durationMinutes: 45,
      recurrence: 'none',
    },
    isArchived: true,
  },
  {
    id: 'meeting:untitled-0a1f' as SavedMeetingId,
    name: null,
    createdAt: new Date(2026, 9, 20, 18, 12),
    schedule: null,
    isArchived: true,
  },
];

export default sampleMeetings;

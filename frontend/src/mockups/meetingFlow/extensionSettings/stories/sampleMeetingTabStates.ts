const atTime = (hours: number, minutes: number) => new Date(2026, 10, 2, hours, minutes);

/**
 * States of "weekly-sync", scheduled 3:00–4:00 PM with a 2 h extension cap and 20/40/60 minute choices.
 */
const sampleMeetingTabStates = {
  canExtend: {
    meeting: { extendedMinutes: 0, now: atTime(15, 56) },
    viewer: { isSignedIn: true },
  },
  nearCap: {
    meeting: { extendedMinutes: 80, now: atTime(17, 16) },
    viewer: { isSignedIn: true },
  },
  atCap: {
    meeting: { extendedMinutes: 120, now: atTime(17, 56) },
    viewer: { isSignedIn: true },
  },
  guest: {
    meeting: { extendedMinutes: 0, now: atTime(15, 56) },
    viewer: { isSignedIn: false },
  },
  unscheduled: {
    meeting: { extendedMinutes: 0, now: atTime(15, 20) },
    viewer: { isSignedIn: true },
  },
} satisfies Record<
  string,
  {
    meeting: { extendedMinutes: number; now: Date };
    viewer: { isSignedIn: boolean };
  }
>;

export type SampleMeetingTabStateKey = keyof typeof sampleMeetingTabStates;

export default sampleMeetingTabStates;

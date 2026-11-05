import type { ExtensionHistoryEntry } from '../types/ExtensionHistoryEntry';

const atTime = (hours: number, minutes: number) => new Date(2026, 10, 2, hours, minutes);

const capHistory: ExtensionHistoryEntry[] = [
  {
    minutes: 60,
    extendedBy: { kind: 'participant', name: 'Ana García' },
    extendedAt: atTime(15, 57),
  },
  {
    minutes: 40,
    extendedBy: { kind: 'participant', name: 'Ben Okafor' },
    extendedAt: atTime(16, 56),
  },
  { minutes: 20, extendedBy: { kind: 'self' }, extendedAt: atTime(17, 37) },
];

/**
 * States of "weekly-sync", scheduled 3:00–4:00 PM with a 2 h extension cap and +20/+40/+60 options.
 */
const sampleMeetingTabStates = {
  canExtend: {
    meeting: { extendedMinutes: 0, now: atTime(15, 56) },
    viewer: { isSignedIn: true, history: [], hasJustExtended: false },
  },
  atCap: {
    meeting: { extendedMinutes: 120, now: atTime(17, 56) },
    viewer: { isSignedIn: true, history: capHistory, hasJustExtended: false },
  },
  guest: {
    meeting: { extendedMinutes: 0, now: atTime(15, 56) },
    viewer: { isSignedIn: false, history: [], hasJustExtended: false },
  },
  afterExtending: {
    meeting: { extendedMinutes: 20, now: atTime(15, 56) },
    viewer: {
      isSignedIn: true,
      history: [{ minutes: 20, extendedBy: { kind: 'self' }, extendedAt: atTime(15, 56) }],
      hasJustExtended: true,
    },
  },
} satisfies Record<
  string,
  {
    meeting: { extendedMinutes: number; now: Date };
    viewer: { isSignedIn: boolean; history: ExtensionHistoryEntry[]; hasJustExtended: boolean };
  }
>;

export type SampleMeetingTabStateKey = keyof typeof sampleMeetingTabStates;

export default sampleMeetingTabStates;

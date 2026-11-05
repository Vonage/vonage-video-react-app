/**
 * Extension states for a meeting scheduled 2:00–3:00 PM, with a 120-minute cap and 20/40/60 options.
 */
const sampleExtensionStates = {
  prompt: { extendedMinutes: 0, now: new Date(2026, 10, 2, 14, 55, 8), isOpen: true },
  partiallyUsed: { extendedMinutes: 80, now: new Date(2026, 10, 2, 16, 15, 8), isOpen: true },
  atCap: { extendedMinutes: 120, now: new Date(2026, 10, 2, 16, 55, 8), isOpen: false },
  anytime: { extendedMinutes: 0, now: new Date(2026, 10, 2, 14, 20, 0), isOpen: true },
  anytimeClosed: { extendedMinutes: 0, now: new Date(2026, 10, 2, 14, 20, 0), isOpen: false },
} as const;

export type SampleExtensionStateKey = keyof typeof sampleExtensionStates;

export default sampleExtensionStates;

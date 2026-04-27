export const DISPLAY_SURFACES = ['monitor', 'window', 'browser'] as const;

export type DisplaySurface = (typeof DISPLAY_SURFACES)[number];

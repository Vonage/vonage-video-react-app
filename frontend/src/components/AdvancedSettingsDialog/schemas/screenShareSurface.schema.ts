import { z } from 'zod';

export type AdvancedSettingsScreenShareSurface = 'default' | 'monitor' | 'window' | 'browser';

export const ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE = {
  default: 'default',
  browser: 'browser',
  window: 'window',
  monitor: 'monitor',
} as const satisfies Record<string, AdvancedSettingsScreenShareSurface>;

export const screenShareSurfaceSchema = z.enum([
  ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE.default,
  ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE.browser,
  ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE.window,
  ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE.monitor,
]) satisfies z.ZodType<AdvancedSettingsScreenShareSurface>;

export default screenShareSurfaceSchema;

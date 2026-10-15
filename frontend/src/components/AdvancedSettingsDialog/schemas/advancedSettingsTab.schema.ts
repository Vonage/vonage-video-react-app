import { z } from 'zod';

export const ADVANCED_SETTINGS_TAB = {
  general: 'general',
  video: 'video',
  screenSharing: 'screenSharing',
  audio: 'audio',
  statistics: 'statistics',
} as const;

export const advancedSettingsTabSchema = z.enum([
  ADVANCED_SETTINGS_TAB.general,
  ADVANCED_SETTINGS_TAB.video,
  ADVANCED_SETTINGS_TAB.screenSharing,
  ADVANCED_SETTINGS_TAB.audio,
  ADVANCED_SETTINGS_TAB.statistics,
]);

export type AdvancedSettingsTab = z.infer<typeof advancedSettingsTabSchema>;

export default advancedSettingsTabSchema;

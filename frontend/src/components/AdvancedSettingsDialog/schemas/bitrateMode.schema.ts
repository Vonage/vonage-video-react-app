import { z } from 'zod';

export const ADVANCED_SETTINGS_BITRATE_MODE = {
  default: 'default',
  bwSaver: 'bw_saver',
  extraBwSaver: 'extra_bw_saver',
  custom: 'custom',
} as const;

export const bitrateModeSchema = z.enum([
  ADVANCED_SETTINGS_BITRATE_MODE.default,
  ADVANCED_SETTINGS_BITRATE_MODE.bwSaver,
  ADVANCED_SETTINGS_BITRATE_MODE.extraBwSaver,
  ADVANCED_SETTINGS_BITRATE_MODE.custom,
]);

export type AdvancedSettingsBitrateMode = z.infer<typeof bitrateModeSchema>;

export default bitrateModeSchema;

import { z } from 'zod';

export const ADVANCED_SETTINGS_AUDIO_BITRATE_MODE = {
  automatic: 'automatic',
  custom: 'custom',
} as const;

export const audioBitrateModeSchema = z.enum([
  ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.automatic,
  ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.custom,
]);

export type AdvancedSettingsAudioBitrateMode = z.infer<typeof audioBitrateModeSchema>;

export default audioBitrateModeSchema;

import { z } from 'zod';

export const ADVANCED_SETTINGS_CODEC_MODE = {
  automatic: 'automatic',
  manual: 'manual',
} as const;

export const codecModeSchema = z.enum([
  ADVANCED_SETTINGS_CODEC_MODE.automatic,
  ADVANCED_SETTINGS_CODEC_MODE.manual,
]);

export type AdvancedSettingsCodecMode = z.infer<typeof codecModeSchema>;

export default codecModeSchema;

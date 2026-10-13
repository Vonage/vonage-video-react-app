import { z } from 'zod';
import { ADVANCED_SETTINGS_CODEC_MODE } from './codecMode.schema';

export const ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE = {
  inherit: 'inherit',
  automatic: ADVANCED_SETTINGS_CODEC_MODE.automatic,
  manual: ADVANCED_SETTINGS_CODEC_MODE.manual,
} as const;

export const screenShareCodecModeSchema = z.enum([
  ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE.inherit,
  ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE.automatic,
  ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE.manual,
]);

export type AdvancedSettingsScreenShareCodecMode = z.infer<typeof screenShareCodecModeSchema>;

export default screenShareCodecModeSchema;

import { z } from 'zod';

export const MIN_CUSTOM_AUDIO_BITRATE_KBPS = 6;
export const MAX_CUSTOM_AUDIO_BITRATE_KBPS = 510;

export const customAudioBitrateSchema = z
  .number()
  .int()
  .min(MIN_CUSTOM_AUDIO_BITRATE_KBPS)
  .max(MAX_CUSTOM_AUDIO_BITRATE_KBPS);

export type AdvancedSettingsCustomAudioBitrate = z.infer<typeof customAudioBitrateSchema>;

export default customAudioBitrateSchema;

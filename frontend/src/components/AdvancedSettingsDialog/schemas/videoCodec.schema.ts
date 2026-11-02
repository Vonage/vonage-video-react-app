import { z } from 'zod';
import type { VideoCodec } from '@vonage/client-sdk-video';

/**
 * Video codec accepted by the publisher, kept in sync with the video SDK `VideoCodec`.
 */
export type AdvancedSettingsVideoCodec = VideoCodec;

export const ADVANCED_SETTINGS_VIDEO_CODEC = {
  vp8: 'vp8',
  vp9: 'vp9',
  h264: 'h264',
} as const satisfies Record<string, AdvancedSettingsVideoCodec>;

export const videoCodecSchema = z.enum([
  ADVANCED_SETTINGS_VIDEO_CODEC.vp8,
  ADVANCED_SETTINGS_VIDEO_CODEC.vp9,
  ADVANCED_SETTINGS_VIDEO_CODEC.h264,
]) satisfies z.ZodType<AdvancedSettingsVideoCodec>;

export default videoCodecSchema;

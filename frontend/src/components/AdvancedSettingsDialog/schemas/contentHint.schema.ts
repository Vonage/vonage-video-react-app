import { z } from 'zod';
import type { VideoContentHint } from '@vonage/client-sdk-video';

/**
 * Content hint accepted by the publisher, kept in sync with the video SDK `VideoContentHint`.
 */
export type AdvancedSettingsContentHint = VideoContentHint;

export const ADVANCED_SETTINGS_CONTENT_HINT = {
  automatic: '',
  motion: 'motion',
  detail: 'detail',
  text: 'text',
} as const satisfies Record<string, AdvancedSettingsContentHint>;

export const contentHintSchema = z.enum([
  ADVANCED_SETTINGS_CONTENT_HINT.automatic,
  ADVANCED_SETTINGS_CONTENT_HINT.motion,
  ADVANCED_SETTINGS_CONTENT_HINT.detail,
  ADVANCED_SETTINGS_CONTENT_HINT.text,
]) satisfies z.ZodType<AdvancedSettingsContentHint>;

export default contentHintSchema;

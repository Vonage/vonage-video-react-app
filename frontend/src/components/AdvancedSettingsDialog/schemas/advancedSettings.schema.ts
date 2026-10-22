import { z } from 'zod';
import { ResolutionSchema } from '@common/schemas';
import { advancedSettingsTabSchema } from './advancedSettingsTab.schema';
import { bitrateModeSchema } from './bitrateMode.schema';
import { codecModeSchema } from './codecMode.schema';
import { screenShareCodecModeSchema } from './screenShareCodecMode.schema';
import { manualCodecOrderSchema } from './manualCodecOrder.schema';
import { contentHintSchema } from './contentHint.schema';
import { audioBitrateModeSchema } from './audioBitrateMode.schema';
import { customVideoBitrateSchema } from './customVideoBitrate.schema';
import { customAudioBitrateSchema } from './customAudioBitrate.schema';
import { frameRateSchema } from './frameRate.schema';
import { screenShareSurfaceSchema } from './screenShareSurface.schema';

export const advancedSettingsSchema = z.object({
  isOpen: z.boolean(),
  selectedTab: advancedSettingsTabSchema,
  bitrateMode: bitrateModeSchema,
  customVideoBitrate: customVideoBitrateSchema,
  codecMode: codecModeSchema,
  codecPriority: manualCodecOrderSchema,
  frameRate: frameRateSchema,
  resolution: ResolutionSchema,
  audioBitrateMode: audioBitrateModeSchema,
  customAudioBitrate: customAudioBitrateSchema,
  enableDtx: z.boolean(),
  publisherAudioFallbackEnabled: z.boolean(),
  subscriberAudioFallbackEnabled: z.boolean(),
  publisherStatisticsEnabled: z.boolean(),
  advancedNoiseSuppressionEnabled: z.boolean(),
  echoCancellationEnabled: z.boolean(),
  noiseSuppressionEnabled: z.boolean(),
  autoGainControlEnabled: z.boolean(),
  selfViewMirroringEnabled: z.boolean(),
  videoStatsOverlayEnabled: z.boolean(),
  cameraContentHint: contentHintSchema,
  screenShareContentHint: contentHintSchema,
  screenShareCodecMode: screenShareCodecModeSchema,
  screenShareCodecPriority: manualCodecOrderSchema,
  scalableScreenshareEnabled: z.boolean(),
  screenShareFrameRate: frameRateSchema.nullable(),
  screenShareResolution: ResolutionSchema.nullable(),
  screenShareBitrateMode: bitrateModeSchema.nullable(),
  screenShareCustomVideoBitrate: customVideoBitrateSchema,
  screenShareSurface: screenShareSurfaceSchema,
});

export type AdvancedSettings = z.infer<typeof advancedSettingsSchema>;

export default advancedSettingsSchema;

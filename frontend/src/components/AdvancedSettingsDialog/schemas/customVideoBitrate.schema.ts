import { z } from 'zod';
import { env } from '../../../env';

export const customVideoBitrateSchema = z
  .number()
  .int()
  .min(env.MIN_CUSTOM_VIDEO_BITRATE_BPS)
  .max(env.MAX_CUSTOM_VIDEO_BITRATE_BPS);

export type AdvancedSettingsCustomVideoBitrate = z.infer<typeof customVideoBitrateSchema>;

export default customVideoBitrateSchema;

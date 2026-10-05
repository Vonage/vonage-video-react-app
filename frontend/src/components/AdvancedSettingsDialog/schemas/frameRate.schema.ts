import { z } from 'zod';
import type { GetUserMediaProperties } from '@vonage/client-sdk-video';
import { isNumber } from '@common/assertions';
import { env } from '../../../env';

/**
 * Frame rate accepted by the publisher, kept in sync with the video SDK
 * `GetUserMediaProperties['frameRate']` so the value can be passed straight to the SDK.
 */
export type AdvancedSettingsFrameRate = NonNullable<GetUserMediaProperties['frameRate']>;

export const frameRateSchema = z.custom<AdvancedSettingsFrameRate>(
  (value): value is AdvancedSettingsFrameRate =>
    isNumber(value) && Number.isInteger(value) && env.SUPPORTED_FRAME_RATES.includes(value),
  { message: 'Unsupported frame rate' }
);

/**
 * Returns the configured supported frame rates parsed against the schema, so callers receive them
 * typed as {@link AdvancedSettingsFrameRate} instead of a raw number list.
 * @returns {AdvancedSettingsFrameRate[]} the supported frame rates
 */
export const getSupportedFrameRates = (): AdvancedSettingsFrameRate[] =>
  env.SUPPORTED_FRAME_RATES.map((frameRate) => frameRateSchema.parse(frameRate));

export default frameRateSchema;

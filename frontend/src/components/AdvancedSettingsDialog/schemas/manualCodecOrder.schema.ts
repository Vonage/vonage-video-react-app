import { z } from 'zod';
import { videoCodecSchema } from './videoCodec.schema';

export const manualCodecOrderSchema = z.tuple([
  videoCodecSchema,
  videoCodecSchema,
  videoCodecSchema,
]);

export type AdvancedSettingsManualCodecOrder = z.infer<typeof manualCodecOrderSchema>;

export default manualCodecOrderSchema;

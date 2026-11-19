import { z } from 'zod';
import BaseArchiveOptionsSchema from './BaseArchiveOptions.schema';

export const ArchiveOptionsWithMaxBitrateSchema = BaseArchiveOptionsSchema.extend({
  maxBitrate: z.number().optional(),
});

export type ArchiveOptionsWithMaxBitrate = z.infer<typeof ArchiveOptionsWithMaxBitrateSchema>;

export default ArchiveOptionsWithMaxBitrateSchema;

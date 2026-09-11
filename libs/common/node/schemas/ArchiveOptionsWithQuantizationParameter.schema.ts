import { z } from 'zod';
import BaseArchiveOptionsSchema from './BaseArchiveOptions.schema';

export const ArchiveOptionsWithQuantizationParameterSchema = BaseArchiveOptionsSchema.extend({
  quantizationParameter: z.number().optional(),
});

export type ArchiveOptionsWithQuantizationParameter = z.infer<
  typeof ArchiveOptionsWithQuantizationParameterSchema
>;

export default ArchiveOptionsWithQuantizationParameterSchema;

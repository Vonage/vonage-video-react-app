import { z } from 'zod';
import type { ArchiveOptions } from '@vonage/video';
import ArchiveOptionsWithMaxBitrateSchema from './ArchiveOptionsWithMaxBitrate.schema';
import ArchiveOptionsWithQuantizationParameterSchema from './ArchiveOptionsWithQuantizationParameter.schema';
import ArchiveWithTranscriptionSchema from './ArchiveWithTranscription.schema';
import ArchiveWithoutTranscriptionSchema from './ArchiveWithoutTranscription.schema';

export const ArchiveOptionsSchema = z.union([
  ArchiveOptionsWithMaxBitrateSchema,
  ArchiveOptionsWithMaxBitrateSchema.and(ArchiveWithTranscriptionSchema),
  ArchiveOptionsWithMaxBitrateSchema.and(ArchiveWithoutTranscriptionSchema),
  ArchiveOptionsWithQuantizationParameterSchema,
  ArchiveOptionsWithQuantizationParameterSchema.and(ArchiveWithTranscriptionSchema),
  ArchiveOptionsWithQuantizationParameterSchema.and(ArchiveWithoutTranscriptionSchema),
  ArchiveWithTranscriptionSchema,
  ArchiveWithoutTranscriptionSchema,
]) as z.ZodType<ArchiveOptions>;

export default ArchiveOptionsSchema;

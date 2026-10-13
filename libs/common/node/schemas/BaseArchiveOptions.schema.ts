import { z } from 'zod';
import ArchiveLayoutSchema from './ArchiveLayout.schema';
import ArchiveOutputModeSchema from './ArchiveOutputMode.schema';
import StreamModeSchema from './StreamMode.schema';
import TranscriptionPropertiesSchema from './TranscriptionProperties.schema';
import { ResolutionSchema } from '@common/schemas';

export const BaseArchiveOptionsSchema = z.object({
  hasAudio: z.boolean().optional(),
  hasVideo: z.boolean().optional(),
  layout: ArchiveLayoutSchema.optional(),
  name: z.string().optional(),
  outputMode: ArchiveOutputModeSchema.optional(),
  resolution: ResolutionSchema.optional(),
  streamMode: StreamModeSchema.optional(),
  hasTranscription: z.boolean().optional(),
  transcriptionProperties: TranscriptionPropertiesSchema.optional(),
});

export type BaseArchiveOptions = z.infer<typeof BaseArchiveOptionsSchema>;

export default BaseArchiveOptionsSchema;

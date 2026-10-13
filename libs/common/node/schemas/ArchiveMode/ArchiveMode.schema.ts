import { z } from 'zod';
import { ArchiveMode } from '@vonage/video';

export const ArchiveModeSchema: z.ZodType<ArchiveMode> = z.enum(ArchiveMode);

export default ArchiveModeSchema;

import { z } from 'zod';
import { ArchiveOutputMode } from '@vonage/video';

export const ArchiveOutputModeSchema: z.ZodType<ArchiveOutputMode> =
  z.nativeEnum(ArchiveOutputMode);

export default ArchiveOutputModeSchema;

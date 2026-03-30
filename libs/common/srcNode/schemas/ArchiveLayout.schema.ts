import { z } from 'zod';
import type { ArchiveLayout } from '@vonage/video';
import LayoutTypeSchema from './LayoutType.schema';

export const ArchiveLayoutSchema: z.ZodType<ArchiveLayout> = z.object({
  type: LayoutTypeSchema,
  stylesheet: z.string().optional(),
  screenshareType: z.string().optional(),
});

export default ArchiveLayoutSchema;

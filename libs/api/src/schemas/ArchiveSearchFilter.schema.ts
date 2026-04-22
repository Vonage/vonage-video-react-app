import type { ArchiveSearchFilter } from '@vonage/video';
import z from 'zod';

/**
 * Schema for filtering archive search results
 */
export const ArchiveSearchFilterSchema = z.object({
  /**
   * The start offset in the list of existing archives.
   */
  offset: z.number().int().nonnegative().optional(),

  /**
   * The number of archives to retrieve starting at the offset.
   * Default is 50, with a maximum of 1000.
   */
  count: z.number().int().min(1).max(1000).optional(),
}) satisfies z.ZodType<ArchiveSearchFilter>;

export default ArchiveSearchFilterSchema;

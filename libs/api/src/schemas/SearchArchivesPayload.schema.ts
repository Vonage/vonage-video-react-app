import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import ArchiveSearchFilterSchema from './ArchiveSearchFilter.schema';

export const SearchArchivesPayloadSchema = VideoPayloadSchema.extend(
  ArchiveSearchFilterSchema.shape
);

export type SearchArchivesPayload = z.infer<typeof SearchArchivesPayloadSchema>;

export default SearchArchivesPayloadSchema;

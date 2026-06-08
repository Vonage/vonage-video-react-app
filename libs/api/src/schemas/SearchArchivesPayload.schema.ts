import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import ArchiveSearchFilterSchema from './ArchiveSearchFilter.schema';

export const SearchArchivesPayloadSchema = VideoPayloadSchema.omit({
  sessionKey: true,
}).extend({
  ...ArchiveSearchFilterSchema.shape,
  sessionKey: VideoPayloadSchema.shape.sessionKey.optional(),
});

export type SearchArchivesPayload = z.infer<typeof SearchArchivesPayloadSchema>;

export default SearchArchivesPayloadSchema;

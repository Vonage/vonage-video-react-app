import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';

export const SearchArchivesPayloadSchema = VideoPayloadSchema;

export type SearchArchivesPayload = z.infer<typeof SearchArchivesPayloadSchema>;

export default SearchArchivesPayloadSchema;

import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import { ArchiveOptionsSchema } from '@node/schemas';

export const StartArchivePayloadSchema = VideoPayloadSchema.extend({
  archiveOptions: ArchiveOptionsSchema.optional(),
});

export type StartArchivePayload = z.infer<typeof StartArchivePayloadSchema>;

export function assertStartArchivePayload(
  payload: unknown
): asserts payload is StartArchivePayload {
  StartArchivePayloadSchema.parse(payload);
}

export default StartArchivePayloadSchema;

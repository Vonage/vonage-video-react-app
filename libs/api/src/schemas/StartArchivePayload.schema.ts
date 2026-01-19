import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';
import type { SessionId } from '@common/types';
import { ArchiveOptionsSchema } from '@node/schemas';

export const StartArchivePayloadSchema = VideoPayloadSchema.extend({
  archiveOptions: ArchiveOptionsSchema,
});

export type StartArchivePayload = z.infer<typeof StartArchivePayloadSchema>;

export function assertStartArchivePayload(
  payload: unknown
): asserts payload is StartArchivePayload & {
  sessionId: SessionId;
} {
  StartArchivePayloadSchema.parse(payload);
}

export default StartArchivePayloadSchema;

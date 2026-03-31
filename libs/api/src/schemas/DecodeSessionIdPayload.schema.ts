import z from 'zod';
import VideoPayloadSchema from './VideoPayload.schema';

export const DecodeSessionIdPayloadSchema = VideoPayloadSchema;

export type DecodeSessionIdPayload = z.infer<typeof DecodeSessionIdPayloadSchema>;

export function assertDecodeSessionIdPayload(
  payload: unknown
): asserts payload is DecodeSessionIdPayload {
  DecodeSessionIdPayloadSchema.parse(payload);
}

export default DecodeSessionIdPayloadSchema;

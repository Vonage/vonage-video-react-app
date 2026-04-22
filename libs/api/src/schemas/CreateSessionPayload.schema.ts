import z from 'zod';
import SessionOptionsSchema from './SessionOptions.schema';
import { RoomNameSchema } from '@common/schemas';

export const CreateSessionPayloadSchema = z.object({
  roomName: RoomNameSchema.optional().nullable(),
  sessionOptions: SessionOptionsSchema.optional(),
});

export type CreateSessionPayload = z.infer<typeof CreateSessionPayloadSchema>;

export function assertCreateSessionPayload(
  payload: unknown
): asserts payload is CreateSessionPayload {
  CreateSessionPayloadSchema.parse(payload);
}

export default CreateSessionPayloadSchema;

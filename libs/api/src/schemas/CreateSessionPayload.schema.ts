import z from 'zod';
import SessionOptionsSchema from './SessionOptions.schema';

export const CreateSessionPayloadSchema = z.object({
  sessionOptions: SessionOptionsSchema.optional(),
});

export type CreateSessionPayload = z.infer<typeof CreateSessionPayloadSchema>;

export function assertCreateSessionPayload(
  payload: unknown
): asserts payload is CreateSessionPayload {
  CreateSessionPayloadSchema.parse(payload);
}

export default CreateSessionPayloadSchema;

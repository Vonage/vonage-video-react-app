import { z } from 'zod';
import CreateSessionPayloadSchema from './CreateSessionPayload.schema';
import ClientTokenOptionsSchema from './ClientTokenOptions.schema';

export const CreateSessionAndJoinPayloadSchema = CreateSessionPayloadSchema.extend({
  clientTokenOptions: ClientTokenOptionsSchema.optional(),
});

export type CreateSessionAndJoinPayload = z.infer<typeof CreateSessionAndJoinPayloadSchema>;

export default CreateSessionAndJoinPayloadSchema;

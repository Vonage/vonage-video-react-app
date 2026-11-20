import { z } from 'zod';
import { SessionKeySchema } from '@node/schemas';
import CreateSessionPayloadSchema from './CreateSessionPayload.schema';
import ClientTokenOptionsSchema from './ClientTokenOptions.schema';

export const CreateSessionAndJoinPayloadSchema = CreateSessionPayloadSchema.omit({
  schedule: true,
}).extend({
  clientTokenOptions: ClientTokenOptionsSchema.optional(),
  sessionKey: SessionKeySchema.optional(),
});

export type CreateSessionAndJoinPayload = z.infer<typeof CreateSessionAndJoinPayloadSchema>;

export default CreateSessionAndJoinPayloadSchema;

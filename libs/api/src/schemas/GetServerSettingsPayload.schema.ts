import { z } from 'zod';
import { SessionKeySchema } from '@node/schemas';

export const GetServerSettingsPayloadSchema = z.object({
  sessionKey: SessionKeySchema.optional(),
});

export type GetServerSettingsPayload = z.infer<typeof GetServerSettingsPayloadSchema>;

export default GetServerSettingsPayloadSchema;

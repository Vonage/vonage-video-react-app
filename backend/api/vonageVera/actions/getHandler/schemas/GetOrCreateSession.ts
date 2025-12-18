import z from 'zod';
import ActionBaseSchema from './ActionBase';

export const GetOrCreateSessionSchema = ActionBaseSchema.extend({
  action: z.literal('getOrCreateSession'),
  payload: z.object({
    sessionId: z.string().optional(),
    // room: z.string(), // TODO: Check, we probably don't need room name for any operation
  }),
});

export type GetOrCreateSession = z.infer<typeof GetOrCreateSessionSchema>;

export default GetOrCreateSessionSchema;

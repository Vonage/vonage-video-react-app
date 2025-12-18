import z from 'zod';
import ActionBaseSchema from './ActionBase';

export const GetOrCreateSessionSchema = ActionBaseSchema.extend({
  action: z.literal('getOrCreateSession'),
  payload: z.object({
    room: z.string(),
  }),
});

export type GetOrCreateSession = z.infer<typeof GetOrCreateSessionSchema>;

export default GetOrCreateSessionSchema;

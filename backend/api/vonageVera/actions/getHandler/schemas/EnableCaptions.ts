import z from 'zod';
import ActionBaseSchema from './ActionBase';

export const EnableCaptionsSchema = ActionBaseSchema.extend({
  action: z.literal('enableCaptions'),
  payload: z.object({
    room: z.string(),
  }),
});

export type EnableCaptions = z.infer<typeof EnableCaptionsSchema>;

export default EnableCaptionsSchema;

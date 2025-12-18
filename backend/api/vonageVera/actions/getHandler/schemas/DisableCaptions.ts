import z from 'zod';
import ActionBaseSchema from './ActionBase';

export const DisableCaptionsSchema = ActionBaseSchema.extend({
  action: z.literal('disableCaptions'),
  payload: z.object({
    room: z.string(),
    captionsId: z.string(),
  }),
});

export type DisableCaptions = z.infer<typeof DisableCaptionsSchema>;

export default DisableCaptionsSchema;

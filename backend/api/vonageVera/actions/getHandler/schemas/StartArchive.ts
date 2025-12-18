import z from 'zod';
import ActionBaseSchema from './ActionBase';

export const StartArchiveSchema = ActionBaseSchema.extend({
  action: z.literal('startArchive'),
  payload: z.object({
    room: z.string(),
  }),
});

export type StartArchive = z.infer<typeof StartArchiveSchema>;

export default StartArchiveSchema;

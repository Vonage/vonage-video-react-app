import z from 'zod';
import ActionBaseSchema from './ActionBase';

export const StopArchiveSchema = ActionBaseSchema.extend({
  action: z.literal('stopArchive'),
  payload: z.object({
    room: z.string(),
    archiveId: z.string(),
  }),
});

export type StopArchive = z.infer<typeof StopArchiveSchema>;

export default StopArchiveSchema;

import z from 'zod';
import ActionBaseSchema from './ActionBase';

export const ListArchivesSchema = ActionBaseSchema.extend({
  action: z.literal('listArchives'),
  payload: z.object({
    room: z.string(),
  }),
});

export type ListArchives = z.infer<typeof ListArchivesSchema>;

export default ListArchivesSchema;

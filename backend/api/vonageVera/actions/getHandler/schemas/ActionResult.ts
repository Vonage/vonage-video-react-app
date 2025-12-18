import z from 'zod';

export const ActionResultSchema = z.object({
  success: z.literal(true),
  message: z.string().nullable(),
  data: z.any(),
});

export type ActionResult<T> = Omit<z.infer<typeof ActionResultSchema>, 'data'> & { data: T };

export default ActionResultSchema;

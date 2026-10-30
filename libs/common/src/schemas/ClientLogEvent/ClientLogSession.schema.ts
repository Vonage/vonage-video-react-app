import z from 'zod';

export const ClientLogSessionSchema = z.object({
  sessionId: z.string().optional(),
  connectionId: z.string().optional(),
  partnerId: z.string().optional(),
  userId: z.string().optional(),
});

export type ClientLogSession = z.infer<typeof ClientLogSessionSchema>;

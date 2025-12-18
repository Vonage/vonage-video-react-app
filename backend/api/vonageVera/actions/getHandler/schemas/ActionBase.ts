import z from 'zod';
import { VeraActionSchema } from './VeraAction';

export const ActionBaseSchema = z.object({
  action: VeraActionSchema,
  sessionId: z.string(),
});

export default ActionBaseSchema;
